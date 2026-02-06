import json
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_

from ..database import get_db
from ..models import Product, Category, Tag, ProductTag, ProductParam, ProductReview, User, Notification
from ..schemas import ProductListItem, ProductDetail, TagResponse, CategoryResponse, ProductQuery, ReviewsSummary, ProductCreate, ProductUpdate
from ..utils.response import success_response, ErrorMessage
from ..dependencies import get_current_admin

router = APIRouter(prefix="/products", tags=["商品"])


def get_product_tags(product: Product) -> List[dict]:
    """获取商品标签列表"""
    return [
        TagResponse(
            id=pt.tag.id,
            name=pt.tag.name,
            color=pt.tag.color
        ).model_dump()
        for pt in product.tags if pt.tag
    ]


def get_reviews_summary(db: Session, product_id: int) -> dict:
    """获取评价统计"""
    reviews = db.query(ProductReview).filter(
        ProductReview.product_id == product_id,
        ProductReview.is_approved == True
    ).all()
    
    if not reviews:
        return {
            "total": 0,
            "average_rating": 0,
            "rating_5": 0,
            "rating_4": 0,
            "rating_3": 0,
            "rating_2": 0,
            "rating_1": 0
        }
    
    total = len(reviews)
    ratings = [r.rating for r in reviews]
    
    return {
        "total": total,
        "average_rating": round(sum(ratings) / total, 1),
        "rating_5": ratings.count(5),
        "rating_4": ratings.count(4),
        "rating_3": ratings.count(3),
        "rating_2": ratings.count(2),
        "rating_1": ratings.count(1)
    }


@router.get("")
async def get_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category_id: Optional[int] = None,
    tag_id: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: Optional[str] = Query(None, description="price_asc, price_desc, sales, newest, popular"),
    keyword: Optional[str] = None,
    is_top: Optional[bool] = None,
    is_published: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """
    获取商品列表
    
    支持分页、筛选和排序
    """
    query = db.query(Product)
    
    # 关键词搜索
    if keyword:
        query = query.filter(
            or_(
                Product.name.contains(keyword),
                Product.short_description.contains(keyword)
            )
        )
    
    # 分类筛选
    if category_id:
        query = query.filter(Product.category_id == category_id)
    
    # 标签筛选
    if tag_id:
        query = query.join(ProductTag).filter(ProductTag.tag_id == tag_id)
    
    # 价格区间
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    
    # 推荐商品
    if is_top is not None:
        query = query.filter(Product.is_top == is_top)
        
    # 上架状态
    if is_published is not None:
        query = query.filter(Product.is_published == is_published)

    
    # 排序
    if sort_by == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Product.price.desc())
    elif sort_by == "newest":
        query = query.order_by(Product.created_at.desc())
    else:  # popular 或默认 -> newest
        query = query.order_by(Product.created_at.desc())
    
    # 分页
    total = query.count()
    products = query.offset((page - 1) * page_size).limit(page_size).all()
    
    # 构建响应
    product_list = []
    for product in products:
        item = {
            "id": product.id,
            "name": product.name,
            "short_description": product.short_description,
            "price": float(product.price),
            "original_price": float(product.original_price) if product.original_price else None,
            "main_image_url": product.main_image_url,
            "stock": product.stock,
            "sales_count": product.sales_count,
            "is_published": product.is_published,
            "tags": get_product_tags(product),
            "category": CategoryResponse.model_validate(product.category).model_dump() if product.category else None
        }
        product_list.append(item)
    
    return success_response(data={
        "list": product_list,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": (total + page_size - 1) // page_size
        }
    })


@router.get("/{product_id}")
async def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    """
    获取商品详情
    """
    product = db.query(Product).options(
        joinedload(Product.category),
        joinedload(Product.tags).joinedload(ProductTag.tag),
        joinedload(Product.params)
    ).filter(Product.id == product_id).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorMessage.PRODUCT_NOT_FOUND
        )
    
    # 增加浏览量
    # product.view_count += 1
    # db.commit()
    
    # 解析图片URLs
    image_urls = []
    if product.image_urls:
        try:
            image_urls = json.loads(product.image_urls)
        except:
            pass
    
    # 构建响应
    result = {
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "short_description": product.short_description,
        "price": float(product.price),
        "original_price": float(product.original_price) if product.original_price else None,
        "stock": product.stock,
        "main_image_url": product.main_image_url,
        "image_urls": image_urls,
        "category": CategoryResponse.model_validate(product.category).model_dump() if product.category else None,
        "tags": get_product_tags(product),
        "params": [{"name": p.name, "value": p.value} for p in sorted(product.params, key=lambda x: x.sort_order)],
        "sales_count": 0, # product.sales_count,
        "view_count": 0, # product.view_count,
        "created_at": product.created_at.isoformat() if product.created_at else None,
        "reviews_summary": get_reviews_summary(db, product_id)
    }
    
    return success_response(data=result)


@router.get("/{product_id}/related")
async def get_related_products(
    product_id: int,
    limit: int = Query(4, ge=1, le=20),
    db: Session = Depends(get_db)
):
    """
    获取相关商品
    
    基于相同分类推荐
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorMessage.PRODUCT_NOT_FOUND
        )
    
    # 查找相同分类的其他商品
    related = db.query(Product).filter(
        Product.category_id == product.category_id,
        Product.id != product_id
        # Product.is_published == True
    ).limit(limit).all() # .order_by(Product.sales_count.desc())
    
    # 如果相同分类商品不足，补充其他热门商品
    if len(related) < limit:
        remaining = limit - len(related)
        existing_ids = [p.id for p in related] + [product_id]
        more = db.query(Product).filter(
            Product.id.notin_(existing_ids)
            # Product.is_published == True
        ).limit(remaining).all() # .order_by(Product.sales_count.desc())
        related.extend(more)
    
    product_list = []
    for p in related:
        item = {
            "id": p.id,
            "name": p.name,
            "short_description": p.short_description,
            "price": float(p.price),
            "original_price": float(p.original_price) if p.original_price else None,
            "main_image_url": p.main_image_url,
            "stock": p.stock,
            "sales_count": 0, # p.sales_count,
            "tags": get_product_tags(p),
            "category": CategoryResponse.model_validate(p.category).model_dump() if p.category else None
        }
        product_list.append(item)
    
    return success_response(data=product_list)


@router.post("")
async def create_product(
    product_dict: ProductCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    创建商品（管理员）
    """
    # 检查分类
    category = db.query(Category).filter(Category.id == product_dict.category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorMessage.CATEGORY_NOT_FOUND
        )

    # 创建商品
    product = Product(
        name=product_dict.name,
        category_id=product_dict.category_id,
        short_description=product_dict.short_description,
        description=product_dict.description,
        price=product_dict.price,
        original_price=product_dict.original_price,
        stock=product_dict.stock,
        # sales_count=0,
        # view_count=0,
        main_image_url=product_dict.main_image_url,
        image_urls=json.dumps(product_dict.image_urls) if product_dict.image_urls else "[]"
        # is_published=product_dict.is_published,
        # is_top=product_dict.is_top
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    # 添加参数
    if product_dict.params:
        for idx, p in enumerate(product_dict.params):
            param = ProductParam(
                product_id=product.id,
                name=p.name,
                value=p.value,
                sort_order=idx
            )
            db.add(param)
        db.commit()

    # 创建新商品通知（全局通知，user_id=None）
    notification = Notification(
        user_id=None,  # 全局通知
        type="new_product",
        title="新商品上架",
        content=f"{product.name} 已上架，快来看看吧！",
        related_id=product.id,
        related_image=product.main_image_url
    )
    db.add(notification)
    db.commit()

    
    # 构造响应
    image_urls_list = []
    if product.image_urls:
         try:
             image_urls_list = json.loads(product.image_urls)
         except:
             pass

    result = {
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "short_description": product.short_description,
        "price": float(product.price),
        "original_price": float(product.original_price) if product.original_price else None,
        "stock": product.stock,
        "main_image_url": product.main_image_url,
        "image_urls": image_urls_list,
        "category": CategoryResponse.model_validate(product.category).model_dump() if product.category else None,
        "tags": get_product_tags(product),
        "params": [{"name": p.name, "value": p.value} for p in sorted(product.params, key=lambda x: x.sort_order)],
        "sales_count": 0,
        "view_count": 0,
        "created_at": product.created_at.isoformat() if product.created_at else None,
        "reviews_summary": {"total": 0, "average_rating": 0, "rating_5": 0, "rating_4": 0, "rating_3": 0, "rating_2": 0, "rating_1": 0}
    }

    return success_response(
        data=result,
        message="商品创建成功"
    )


@router.put("/{product_id}")
async def update_product(
    product_id: int,
    product_data: ProductUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    更新商品（管理员）
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorMessage.PRODUCT_NOT_FOUND
        )

    # 更新字段
    update_data = product_data.model_dump(exclude_unset=True)
    
    # 特殊处理 JSON 和 关联字段
    if "image_urls" in update_data:
        product.image_urls = json.dumps(update_data.pop("image_urls"))
    
    # 更新参数需要先删除旧的再添加新的？或者差异更新。这里简单处理：如果有params字段，全量替换
    if "params" in update_data:
        params_data = update_data.pop("params")
        # 删除旧参数
        db.query(ProductParam).filter(ProductParam.product_id == product.id).delete()
        # 添加新参数
        if params_data:
            for idx, p in enumerate(params_data):
                param = ProductParam(
                    product_id=product.id,
                    name=p["name"],
                    value=p["value"],
                    sort_order=idx
                )
                db.add(param)

    # 过滤不支持的字段
    unsupported_fields = ["is_top", "is_published", "sales_count", "view_count"]
    for field in unsupported_fields:
        if field in update_data:
            del update_data[field]

    # 更新其他字段
    for key, value in update_data.items():
        if hasattr(product, key): # 确保只更新存在的字段
             setattr(product, key, value)

    db.commit()
    db.refresh(product)

    # 构造响应
    image_urls_list = []
    if product.image_urls:
         try:
             image_urls_list = json.loads(product.image_urls)
         except:
             pass

    result = {
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "short_description": product.short_description,
        "price": float(product.price),
        "original_price": float(product.original_price) if product.original_price else None,
        "stock": product.stock,
        "main_image_url": product.main_image_url,
        "image_urls": image_urls_list,
        "category": CategoryResponse.model_validate(product.category).model_dump() if product.category else None,
        "tags": get_product_tags(product),
        "params": [{"name": p.name, "value": p.value} for p in sorted(product.params, key=lambda x: x.sort_order)],
        "sales_count": 0,
        "view_count": 0,
        "created_at": product.created_at.isoformat() if product.created_at else None,
        "reviews_summary": get_reviews_summary(db, product_id)
    }

    return success_response(
        data=result,
        message="商品更新成功"
    )


@router.delete("/{product_id}")
async def delete_product(
    product_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    删除商品（管理员）
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorMessage.PRODUCT_NOT_FOUND
        )

    # Soft Delete Implementation
    try:
        product.is_published = False
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"删除失败: {str(e)}"
        )

    return success_response(message="商品已下架（软删除）")
