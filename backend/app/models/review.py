from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base


class ProductReview(Base):
    """商品评价模型"""
    __tablename__ = "product_reviews"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5
    content = Column(Text, nullable=False)
    image_urls = Column(Text)  # JSON 格式存储评价图片
    is_approved = Column(Boolean, default=True)
    like_count = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # 关系
    user = relationship("User", back_populates="reviews")
    product = relationship("Product", back_populates="reviews")
    replies = relationship("ReviewReply", back_populates="review", cascade="all, delete-orphan")
    likes = relationship("ReviewLike", back_populates="review", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<ProductReview(id={self.id}, rating={self.rating})>"


class ReviewReply(Base):
    """评价回复模型"""
    __tablename__ = "review_replies"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    review_id = Column(Integer, ForeignKey("product_reviews.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    parent_reply_id = Column(Integer, ForeignKey("review_replies.id"))
    created_at = Column(DateTime, server_default=func.now())
    
    # 关系
    review = relationship("ProductReview", back_populates="replies")
    
    def __repr__(self):
        return f"<ReviewReply(id={self.id})>"


class ReviewLike(Base):
    """评价点赞模型"""
    __tablename__ = "review_likes"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    review_id = Column(Integer, ForeignKey("product_reviews.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, server_default=func.now())
    
    # 关系
    review = relationship("ProductReview", back_populates="likes")
    
    def __repr__(self):
        return f"<ReviewLike(review_id={self.review_id}, user_id={self.user_id})>"
