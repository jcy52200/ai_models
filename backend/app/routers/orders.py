import json
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from decimal import Decimal

from ..database import get_db
from ..models import User, Order, OrderItem, CartItem, Product, UserAddress
from ..schemas import OrderCreate, OrderCancel, OrderListItem, OrderDetail, ShippingAddress, OrderTimeline, OrderUpdateStatus
from ..utils.response import success_response, ErrorMessage
from ..dependencies import get_current_user, get_current_admin

router = APIRouter(prefix="/orders", tags=["订单"])


def generate_order_number() -> str:
    """生成订单号"""
    now = datetime.now()
    import random
    return f"SJ{now.strftime('%Y%m%d%H%M%S')}{random.randint(1000, 9999)}"


def build_order_timelines(order: Order) -> List[dict]:
    """构建订单时间线"""
    timelines = []
    
    if order.created_at:
        timelines.append({
            "status": "created",
            "status_text": "订单创建",
            "time": order.created_at.isoformat()
        })
    
    if order.paid_at:
        timelines.append({
            "status": "paid",
            "status_text": "已支付",
            "time": order.paid_at.isoformat()
        })
    
    if order.shipped_at:
        timelines.append({
            "status": "shipped",
            "status_text": "已发货",
            "time": order.shipped_at.isoformat()
        })
    
    if order.completed_at:
        timelines.append({
            "status": "completed",
            "status_text": "已完成",
            "time": order.completed_at.isoformat()
        })
    
    if order.cancelled_at:
        timelines.append({
            "status": "cancelled",
            "status_text": "已取消",
            "time": order.cancelled_at.isoformat()
        })
    
    return timelines


def build_order_response(order: Order) -> dict:
    """构建订单响应"""
    status_map = {
        "pending": "待支付",
        "paid": "待发货",
        "shipped": "待收货",
        "completed": "已完成",
        "cancelled": "已取消",
        "refunded": "已退款"
    }
    
    return {
        "id": order.id,
        "order_number": order.order_number,
        "total_amount": float(order.total_amount),
        "status": order.status,
        "status_text": status_map.get(order.status, "未知"),
        "items": [
            {
                "id": item.id,
                "product_id": item.product_id,
                "product_name": item.product_name,
                "product_image": item.product_image,
                "unit_price": float(item.unit_price),
                "quantity": item.quantity,
                "subtotal": float(item.subtotal)
            }
            for item in order.items
        ],
        "created_at": order.created_at.isoformat() if order.created_at else None
    }


@router.post("")
async def create_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    创建订单（结算）
    """
    # 获取购物车项
    cart_items = db.query(CartItem).options(
        joinedload(CartItem.product)
    ).filter(
        CartItem.id.in_(order_data.cart_item_ids),
        CartItem.user_id == current_user.id
    ).all()
    
    if not cart_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ErrorMessage.CART_EMPTY
        )
    
    # 获取收货地址
    address = db.query(UserAddress).filter(
        UserAddress.id == order_data.address_id,
        UserAddress.user_id == current_user.id
    ).first()
    
    if not address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorMessage.ADDRESS_NOT_FOUND
        )
    
    # 计算总金额并检查库存
    total_amount = Decimal("0")
    order_items = []
    
    for cart_item in cart_items:
        product = cart_item.product
        if not product:
            continue
        
        if product.stock < cart_item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"商品 {product.name} 库存不足"
            )
        
        subtotal = Decimal(str(product.price)) * cart_item.quantity
        total_amount += subtotal
        
        order_items.append({
            "product_id": product.id,
            "product_name": product.name,
            "product_image": product.main_image_url,
            "unit_price": product.price,
            "quantity": cart_item.quantity,
            "subtotal": subtotal
        })
    
    # 创建订单
    shipping_address = {
        "recipient_name": address.recipient_name,
        "phone": address.phone,
        "province": address.province,
        "city": address.city,
        "district": address.district,
        "detail_address": address.detail_address
    }
    
    order = Order(
        order_number=generate_order_number(),
        user_id=current_user.id,
        total_amount=total_amount,
        status="pending",
        payment_method=order_data.payment_method,
        shipping_address=json.dumps(shipping_address, ensure_ascii=False),
        shipping_fee=0,
        note=order_data.note
    )
    
    db.add(order)
    db.flush()  # 获取 order.id
    
    # 创建订单项
    for item_data in order_items:
        order_item = OrderItem(
            order_id=order.id,
            **item_data
        )
        db.add(order_item)
    
    # 扣减库存
    for cart_item in cart_items:
        if cart_item.product:
            cart_item.product.stock -= cart_item.quantity
    
    # 删除购物车项
    for cart_item in cart_items:
        db.delete(cart_item)
    
    db.commit()
    db.refresh(order)
    
    # 构建支付信息（模拟）
    payment_info = {
        "payment_url": f"https://pay.example.com/order/{order.order_number}",
        "expire_at": datetime.now().isoformat()
    }
    
    return success_response(
        data={
            "order": build_order_response(order),
            "payment": payment_info
        },
        message="订单创建成功"
    )


@router.get("")
async def get_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    order_status: Optional[str] = Query(None, alias="status", description="pending, paid, shipped, completed, cancelled, refunded"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    获取订单列表
    """
    query = db.query(Order).options(
        joinedload(Order.items)
    ).filter(Order.user_id == current_user.id)
    
    if order_status:
        query = query.filter(Order.status == order_status)
    
    total = query.count()
    orders = query.order_by(Order.created_at.desc()).offset(
        (page - 1) * page_size
    ).limit(page_size).all()
    
    return success_response(data={
        "list": [build_order_response(order) for order in orders],
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total
        }
    })


@router.get("/all")
async def get_all_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    order_number: Optional[str] = None,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    获取所有订单（管理员）
    """
    query = db.query(Order).options(
        joinedload(Order.items),
        joinedload(Order.user)
    )
    
    if status:
        query = query.filter(Order.status == status)
    
    if order_number:
        query = query.filter(Order.order_number.contains(order_number))
    
    total = query.count()
    orders = query.order_by(Order.created_at.desc()).offset(
        (page - 1) * page_size
    ).limit(page_size).all()
    
    return success_response(data={
        "list": [build_order_response(order) for order in orders],
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": (total + page_size - 1) // page_size
        }
    })


@router.get("/admin/{order_id}")
async def get_admin_order(
    order_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    获取订单详情（管理员）
    """
    order = db.query(Order).options(
        joinedload(Order.items),
        joinedload(Order.user)
    ).filter(
        Order.id == order_id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorMessage.ORDER_NOT_FOUND
        )
    
    # 解析收货地址
    shipping_address = None
    if order.shipping_address:
        try:
            shipping_address = json.loads(order.shipping_address)
        except:
            pass
    
    status_map = {
        "pending": "待支付",
        "paid": "待发货",
        "shipped": "待收货",
        "completed": "已完成",
        "cancelled": "已取消",
        "refunded": "已退款"
    }
    
    result = {
        "id": order.id,
        "order_number": order.order_number,
        "total_amount": float(order.total_amount),
        "status": order.status,
        "status_text": status_map.get(order.status, "未知"),
        "payment_method": order.payment_method,
        "shipping_address": shipping_address,
        "shipping_fee": float(order.shipping_fee) if order.shipping_fee else 0,
        "note": order.note,
        "user_id": order.user_id,
        "username": order.user.username if order.user else "Unknown",
        "items": [
            {
                "id": item.id,
                "product_id": item.product_id,
                "product_name": item.product_name,
                "product_image": item.product_image,
                "unit_price": float(item.unit_price),
                "quantity": item.quantity,
                "subtotal": float(item.subtotal)
            }
            for item in order.items
        ],
        "timelines": build_order_timelines(order),
        "created_at": order.created_at.isoformat() if order.created_at else None,
        "paid_at": order.paid_at.isoformat() if order.paid_at else None,
        "shipped_at": order.shipped_at.isoformat() if order.shipped_at else None,
        "completed_at": order.completed_at.isoformat() if order.completed_at else None
    }
    
    return success_response(data=result)


@router.get("/{order_id}")
async def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    获取订单详情
    """
    order = db.query(Order).options(
        joinedload(Order.items)
    ).filter(
        Order.id == order_id,
        Order.user_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorMessage.ORDER_NOT_FOUND
        )
    
    # 解析收货地址
    shipping_address = None
    if order.shipping_address:
        try:
            shipping_address = json.loads(order.shipping_address)
        except:
            pass
    
    status_map = {
        "pending": "待支付",
        "paid": "待发货",
        "shipped": "待收货",
        "completed": "已完成",
        "cancelled": "已取消",
        "refunded": "已退款"
    }
    
    result = {
        "id": order.id,
        "order_number": order.order_number,
        "total_amount": float(order.total_amount),
        "status": order.status,
        "status_text": status_map.get(order.status, "未知"),
        "payment_method": order.payment_method,
        "shipping_address": shipping_address,
        "shipping_fee": float(order.shipping_fee) if order.shipping_fee else 0,
        "note": order.note,
        "items": [
            {
                "id": item.id,
                "product_id": item.product_id,
                "product_name": item.product_name,
                "product_image": item.product_image,
                "unit_price": float(item.unit_price),
                "quantity": item.quantity,
                "subtotal": float(item.subtotal)
            }
            for item in order.items
        ],
        "timelines": build_order_timelines(order),
        "created_at": order.created_at.isoformat() if order.created_at else None,
        "paid_at": order.paid_at.isoformat() if order.paid_at else None,
        "shipped_at": order.shipped_at.isoformat() if order.shipped_at else None,
        "completed_at": order.completed_at.isoformat() if order.completed_at else None
    }
    
    return success_response(data=result)


@router.put("/{order_id}/cancel")
async def cancel_order(
    order_id: int,
    cancel_data: OrderCancel,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    取消订单
    """
    order = db.query(Order).options(
        joinedload(Order.items)
    ).filter(
        Order.id == order_id,
        Order.user_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorMessage.ORDER_NOT_FOUND
        )
    
    # 只有待支付的订单才能取消
    if order.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ErrorMessage.CANNOT_CANCEL_ORDER
        )
    
    # 恢复库存
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            product.stock += item.quantity
    
    order.status = "cancelled"
    order.cancelled_at = datetime.now()
    order.note = f"取消原因: {cancel_data.reason}"
    
    db.commit()
    
    return success_response(message="订单已取消")


@router.put("/{order_id}/refund")
async def request_refund(
    order_id: int,
    cancel_data: OrderCancel,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    申请退款
    """
    order = db.query(Order).options(
        joinedload(Order.items)
    ).filter(
        Order.id == order_id,
        Order.user_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorMessage.ORDER_NOT_FOUND
        )
    
    # 只有已支付的订单才能退款 (发货后通常走售后流程，这里简化为未发货可退款)
    if order.status != "paid":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="当前订单状态不可退款"
        )
    
    # 恢复库存
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            product.stock += item.quantity
    
    order.status = "refunded"
    order.note = f"{order.note or ''}\n退款原因: {cancel_data.reason}"
    
    db.commit()
    
    return success_response(message="退款成功")


@router.put("/{order_id}/confirm")
async def confirm_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    确认收货
    """
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorMessage.ORDER_NOT_FOUND
        )
    
    # 只有已发货的订单才能确认收货
    if order.status != "shipped":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="只有已发货的订单才能确认收货"
        )
    
    order.status = "completed"
    order.completed_at = datetime.now()
    
    db.commit()
    
    return success_response(message="确认收货成功")


@router.put("/{order_id}/pay")
async def simulate_pay(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    模拟支付
    """
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorMessage.ORDER_NOT_FOUND
        )
            
    # if order.status != "pending":
    #      raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail="订单已支付或状态不正确"
    #     )
    
    order.status = "paid"
    order.paid_at = datetime.now()
    
    db.commit()
    
    return success_response(message="支付成功")





@router.put("/{order_id}/status")
async def update_order_status(
    order_id: int,
    status_data: OrderUpdateStatus,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    更新订单状态（管理员）
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorMessage.ORDER_NOT_FOUND
        )
    
    old_status = order.status
    new_status = status_data.status
    
    # 更新状态逻辑
    if new_status == "shipped" and old_status == "paid":
        order.shipped_at = datetime.now()
        # 这里可以保存 tracking_number
    elif new_status == "completed" and old_status == "shipped":
        order.completed_at = datetime.now()
    elif new_status == "cancelled":
        # 恢复库存等逻辑（如果尚未发货）
        pass
        
    order.status = new_status
    db.commit()
    
    return success_response(message="订单状态更新成功")
