from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from decimal import Decimal

from ..database import get_db
from ..models import User, Product, CartItem
from ..schemas import CartItemCreate, CartItemUpdate, CartSelect, CartResponse, CartItemResponse, CartItemProduct
from ..utils.response import success_response, ErrorMessage
from ..dependencies import get_current_user

router = APIRouter(prefix="/cart", tags=["购物车"])


def build_cart_response(cart_items: List[CartItem]) -> dict:
    """构建购物车响应"""
    items = []
    total_count = 0
    total_amount = Decimal("0")
    
    for item in cart_items:
        if item.product:
            subtotal = Decimal(str(item.product.price)) * item.quantity
            items.append({
                "id": item.id,
                "product": {
                    "id": item.product.id,
                    "name": item.product.name,
                    "price": float(item.product.price),
                    "main_image_url": item.product.main_image_url,
                    "stock": item.product.stock
                },
                "quantity": item.quantity,
                "subtotal": float(subtotal),
                "added_at": item.added_at.isoformat() if item.added_at else None
            })
            total_count += item.quantity
            total_amount += subtotal
    
    return {
        "items": items,
        "total_count": total_count,
        "total_amount": float(total_amount)
    }


@router.get("")
async def get_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    获取购物车列表
    """
    cart_items = db.query(CartItem).options(
        joinedload(CartItem.product)
    ).filter(
        CartItem.user_id == current_user.id
    ).order_by(CartItem.added_at.desc()).all()
    
    return success_response(data=build_cart_response(cart_items))


@router.post("")
async def add_to_cart(
    item_data: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    添加商品到购物车
    """
    # 检查商品是否存在
    product = db.query(Product).filter(
        Product.id == item_data.product_id
    ).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorMessage.PRODUCT_NOT_FOUND
        )
    
    # 检查库存
    if product.stock < item_data.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ErrorMessage.OUT_OF_STOCK
        )
    
    # 检查是否已在购物车中
    existing_item = db.query(CartItem).filter(
        CartItem.user_id == current_user.id,
        CartItem.product_id == item_data.product_id
    ).first()
    
    if existing_item:
        # 更新数量
        new_quantity = existing_item.quantity + item_data.quantity
        if new_quantity > product.stock:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=ErrorMessage.OUT_OF_STOCK
            )
        existing_item.quantity = new_quantity
        db.commit()
    else:
        # 新增购物车项
        cart_item = CartItem(
            user_id=current_user.id,
            product_id=item_data.product_id,
            quantity=item_data.quantity
        )
        db.add(cart_item)
        db.commit()
    
    # 返回购物车
    cart_items = db.query(CartItem).options(
        joinedload(CartItem.product)
    ).filter(CartItem.user_id == current_user.id).all()
    
    return success_response(
        data=build_cart_response(cart_items),
        message="添加成功"
    )


@router.put("/{cart_item_id}")
async def update_cart_item(
    cart_item_id: int,
    item_data: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    更新购物车商品数量
    """
    cart_item = db.query(CartItem).options(
        joinedload(CartItem.product)
    ).filter(
        CartItem.id == cart_item_id,
        CartItem.user_id == current_user.id
    ).first()
    
    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="购物车项不存在"
        )
    
    # 检查库存
    if cart_item.product and item_data.quantity > cart_item.product.stock:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ErrorMessage.OUT_OF_STOCK
        )
    
    cart_item.quantity = item_data.quantity
    db.commit()
    
    # 返回购物车
    cart_items = db.query(CartItem).options(
        joinedload(CartItem.product)
    ).filter(CartItem.user_id == current_user.id).all()
    
    return success_response(
        data=build_cart_response(cart_items),
        message="更新成功"
    )


@router.delete("/{cart_item_id}")
async def delete_cart_item(
    cart_item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    删除购物车商品
    """
    cart_item = db.query(CartItem).filter(
        CartItem.id == cart_item_id,
        CartItem.user_id == current_user.id
    ).first()
    
    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="购物车项不存在"
        )
    
    db.delete(cart_item)
    db.commit()
    
    return success_response(message="删除成功")


@router.delete("")
async def clear_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    清空购物车
    """
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
    db.commit()
    
    return success_response(message="购物车已清空")
