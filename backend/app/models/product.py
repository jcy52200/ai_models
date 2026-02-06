from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Numeric, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base


class Category(Base):
    """商品分类模型"""
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(Text)
    parent_id = Column(Integer, default=0)
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    
    # 关系
    products = relationship("Product", back_populates="category")
    
    def __repr__(self):
        return f"<Category(id={self.id}, name={self.name})>"


class Tag(Base):
    """商品标签模型"""
    __tablename__ = "tags"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)
    color = Column(String(20), default="#000000")
    created_at = Column(DateTime, server_default=func.now())
    
    # 关系
    products = relationship("ProductTag", back_populates="tag")
    
    def __repr__(self):
        return f"<Tag(id={self.id}, name={self.name})>"


class Product(Base):
    """商品模型"""
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(200), nullable=False, index=True)
    description = Column(Text)
    short_description = Column(Text)
    price = Column(Numeric(10, 2), nullable=False)
    original_price = Column(Numeric(10, 2))
    stock = Column(Integer, default=0)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False, index=True)
    main_image_url = Column(String(255))
    image_urls = Column(Text)  # JSON 格式存储多图
    is_top = Column(Boolean, default=False)
    is_published = Column(Boolean, default=True)
    sales_count = Column(Integer, default=0)
    view_count = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # 关系
    category = relationship("Category", back_populates="products")
    tags = relationship("ProductTag", back_populates="product", cascade="all, delete-orphan")
    params = relationship("ProductParam", back_populates="product", cascade="all, delete-orphan")
    reviews = relationship("ProductReview", back_populates="product")
    cart_items = relationship("CartItem", back_populates="product")
    
    def __repr__(self):
        return f"<Product(id={self.id}, name={self.name})>"


class ProductTag(Base):
    """商品-标签关联模型"""
    __tablename__ = "product_tags"
    
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), primary_key=True)
    tag_id = Column(Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True)
    
    # 关系
    product = relationship("Product", back_populates="tags")
    tag = relationship("Tag", back_populates="products")


class ProductParam(Base):
    """商品参数模型"""
    __tablename__ = "product_params"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(50), nullable=False)
    value = Column(String(200), nullable=False)
    sort_order = Column(Integer, default=0)
    
    # 关系
    product = relationship("Product", back_populates="params")
    
    def __repr__(self):
        return f"<ProductParam(id={self.id}, name={self.name})>"
