from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from decimal import Decimal


# ==================== 购物车相关 ====================

class CartItemProduct(BaseModel):
    """购物车商品信息"""
    id: int
    name: str
    price: Decimal
    main_image_url: Optional[str] = None
    stock: int

    class Config:
        from_attributes = True


class CartItemResponse(BaseModel):
    """购物车项响应"""
    id: int
    product: CartItemProduct
    quantity: int
    subtotal: Decimal
    added_at: datetime

    class Config:
        from_attributes = True


class CartResponse(BaseModel):
    """购物车响应"""
    items: List[CartItemResponse]
    total_count: int
    total_amount: Decimal


class CartItemCreate(BaseModel):
    """添加购物车请求"""
    product_id: int
    quantity: int = Field(1, ge=1)


class CartItemUpdate(BaseModel):
    """更新购物车数量请求"""
    quantity: int = Field(..., ge=1)


class CartSelect(BaseModel):
    """选择购物车项请求"""
    cart_item_ids: List[int]
