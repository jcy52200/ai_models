from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from decimal import Decimal


# ==================== 订单项相关 ====================

class OrderItemResponse(BaseModel):
    """订单项响应"""
    id: int
    product_id: int
    product_name: str
    product_image: Optional[str] = None
    unit_price: Decimal
    quantity: int
    subtotal: Decimal

    class Config:
        from_attributes = True


# ==================== 订单时间线 ====================

class OrderTimeline(BaseModel):
    """订单时间线"""
    status: str
    status_text: str
    time: datetime
    description: Optional[str] = None


# ==================== 收货地址 ====================

class ShippingAddress(BaseModel):
    """收货地址"""
    recipient_name: str
    phone: str
    province: str
    city: str
    district: str
    detail_address: str


# ==================== 订单相关 ====================

class OrderCreate(BaseModel):
    """创建订单请求"""
    cart_item_ids: List[int]
    address_id: int
    payment_method: str = Field(..., description="alipay, wechat, unionpay")
    note: Optional[str] = None
    use_balance: bool = False
    coupon_code: Optional[str] = None


class OrderListItem(BaseModel):
    """订单列表项"""
    id: int
    order_number: str
    total_amount: Decimal
    status: str
    status_text: str
    items: List[OrderItemResponse]
    created_at: datetime

    class Config:
        from_attributes = True


class OrderDetail(OrderListItem):
    """订单详情"""
    payment_method: Optional[str] = None
    shipping_address: Optional[ShippingAddress] = None
    shipping_fee: Decimal
    note: Optional[str] = None
    timelines: List[OrderTimeline] = []
    paid_at: Optional[datetime] = None
    shipped_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class OrderListResponse(BaseModel):
    """订单列表响应"""
    list: List[OrderListItem]
    pagination: dict


class OrderCancel(BaseModel):
    """取消订单请求"""
    reason: str


class RefundCreate(BaseModel):
    """申请退款请求"""
    refund_amount: Decimal
    reason: str
    description: Optional[str] = None


class PaymentInfo(BaseModel):
    """支付信息"""
    order_id: int
    order_number: str
    amount: Decimal
    payment_method: str
    payment_url: Optional[str] = None
    expire_at: datetime
    qr_code: Optional[str] = None


class OrderUpdateStatus(BaseModel):
    """更新订单状态请求 (管理员)"""
    status: str = Field(..., description="pending, paid, shipped, completed, cancelled, refunded")
    tracking_number: Optional[str] = None
