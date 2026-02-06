from sqlalchemy import Column, Integer, String, DateTime, Text, Numeric, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base


class Order(Base):
    """订单模型"""
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    order_number = Column(String(50), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    total_amount = Column(Numeric(10, 2), nullable=False)
    status = Column(String(20), default="pending", index=True)  # pending, paid, shipped, completed, cancelled, refunded
    payment_method = Column(String(50))
    shipping_address = Column(Text)  # JSON 格式存储地址信息
    shipping_fee = Column(Numeric(10, 2), default=0)
    note = Column(Text)
    paid_at = Column(DateTime)
    shipped_at = Column(DateTime)
    completed_at = Column(DateTime)
    cancelled_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # 关系
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    refunds = relationship("Refund", back_populates="order")
    
    def __repr__(self):
        return f"<Order(id={self.id}, order_number={self.order_number})>"
    
    @property
    def status_text(self) -> str:
        """获取状态文本"""
        status_map = {
            "pending": "待支付",
            "paid": "待发货",
            "shipped": "待收货",
            "completed": "已完成",
            "cancelled": "已取消",
            "refunded": "已退款"
        }
        return status_map.get(self.status, "未知")


class OrderItem(Base):
    """订单项模型"""
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    product_name = Column(String(200), nullable=False)
    product_image = Column(String(255))
    unit_price = Column(Numeric(10, 2), nullable=False)
    quantity = Column(Integer, nullable=False)
    subtotal = Column(Numeric(10, 2), nullable=False)
    
    # 关系
    order = relationship("Order", back_populates="items")
    
    def __repr__(self):
        return f"<OrderItem(id={self.id}, product={self.product_name})>"


class Refund(Base):
    """退款申请模型"""
    __tablename__ = "refunds"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    refund_amount = Column(Numeric(10, 2), nullable=False)
    reason = Column(Text, nullable=False)
    description = Column(Text)
    status = Column(String(20), default="pending")  # pending, approved, rejected, completed
    admin_notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    processed_at = Column(DateTime)
    
    # 关系
    order = relationship("Order", back_populates="refunds")
    
    def __repr__(self):
        return f"<Refund(id={self.id}, order_id={self.order_id})>"
