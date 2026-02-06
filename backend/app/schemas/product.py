from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from decimal import Decimal


# ==================== 分类相关 ====================

class CategoryBase(BaseModel):
    """分类基础模型"""
    name: str = Field(..., max_length=50)
    description: Optional[str] = None
    parent_id: int = 0
    sort_order: int = 0
    is_active: bool = True


class CategoryResponse(BaseModel):
    """分类响应"""
    id: int
    name: str
    description: Optional[str] = None
    parent_id: int
    sort_order: int
    is_active: bool = True
    children: Optional[List["CategoryResponse"]] = None

    class Config:
        from_attributes = True


class CategoryCreate(CategoryBase):
    """创建分类"""
    pass


class CategoryUpdate(BaseModel):
    """更新分类"""
    name: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None
    parent_id: Optional[int] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


# ==================== 标签相关 ====================

class TagResponse(BaseModel):
    """标签响应"""
    id: int
    name: str
    color: str

    class Config:
        from_attributes = True


# ==================== 商品相关 ====================

class ProductParam(BaseModel):
    """商品参数"""
    name: str
    value: str


class ProductListItem(BaseModel):
    """商品列表项"""
    id: int
    name: str
    short_description: Optional[str] = None
    price: Decimal
    original_price: Optional[Decimal] = None
    main_image_url: Optional[str] = None
    stock: int
    sales_count: int = 0
    is_published: bool = True
    tags: List[TagResponse] = []
    category: Optional[CategoryResponse] = None

    class Config:
        from_attributes = True


class ProductDetail(ProductListItem):
    """商品详情"""
    description: Optional[str] = None
    image_urls: Optional[List[str]] = None
    params: List[ProductParam] = []
    view_count: int = 0
    created_at: datetime
    reviews_summary: Optional[dict] = None


class ProductListResponse(BaseModel):
    """商品列表响应"""
    list: List[ProductListItem]
    pagination: dict


class ProductQuery(BaseModel):
    """商品查询参数"""
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)
    category_id: Optional[int] = None
    tag_id: Optional[int] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    sort_by: Optional[str] = Field(None, description="price_asc, price_desc, sales, newest, popular")
    keyword: Optional[str] = None
    is_top: Optional[bool] = None


class ProductCreate(BaseModel):
    """创建商品请求"""
    name: str = Field(..., max_length=100)
    category_id: int
    short_description: Optional[str] = None
    description: Optional[str] = None
    price: Decimal = Field(..., gt=0)
    original_price: Optional[Decimal] = None
    stock: int = Field(0, ge=0)
    main_image_url: Optional[str] = None
    image_urls: Optional[List[str]] = []
    params: Optional[List[ProductParam]] = []
    is_published: bool = True
    is_top: bool = False
    is_new: bool = False


class ProductUpdate(BaseModel):
    """更新商品请求"""
    name: Optional[str] = None
    category_id: Optional[int] = None
    short_description: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    original_price: Optional[Decimal] = None
    stock: Optional[int] = None
    main_image_url: Optional[str] = None
    image_urls: Optional[List[str]] = None
    params: Optional[List[ProductParam]] = None
    is_published: Optional[bool] = None
    is_top: Optional[bool] = None
    is_new: Optional[bool] = None
