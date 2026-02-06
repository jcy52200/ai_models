"""
通知模型
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..database import Base


class Notification(Base):
    """通知表"""
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)  # NULL = 全局通知
    type = Column(String(50), nullable=False, index=True)  # new_product, order_status, etc.
    title = Column(String(200), nullable=False)
    content = Column(Text)
    related_id = Column(Integer)  # 关联的商品/订单 ID
    related_image = Column(String(500))  # 关联的图片URL
    is_read = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, server_default=func.now())

    # 关系（可选，如果 user_id 不为 NULL）
    user = relationship("User", backref="notifications")

    def __repr__(self):
        return f"<Notification(id={self.id}, type={self.type}, user_id={self.user_id})>"
