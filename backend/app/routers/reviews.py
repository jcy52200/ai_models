import json
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models import User, Product, Order, ProductReview, ReviewLike
from ..schemas import ReviewCreate, ReviewResponse, ReviewUser
from ..utils.response import success_response, ErrorMessage
from ..dependencies import get_current_user, get_current_user_optional, get_current_admin

router = APIRouter(tags=["评价"])


def build_review_response(review: ProductReview, current_user_id: Optional[int] = None) -> dict:
    """构建评价响应"""
    # 解析图片URLs
    image_urls = []
    if review.image_urls:
        try:
            image_urls = json.loads(review.image_urls)
        except:
            pass
    
    # 检查当前用户是否点赞
    is_liked = False
    if current_user_id:
        for like in review.likes:
            if like.user_id == current_user_id:
                is_liked = True
                break
    
    return {
        "id": review.id,
        "user": {
            "id": review.user.id,
            "username": review.user.username[:3] + "***" if len(review.user.username) > 3 else review.user.username + "***",
            "avatar_url": review.user.avatar_url
        },
        "rating": review.rating,
        "content": review.content,
        "image_urls": image_urls,
        "like_count": review.like_count,
        "is_liked": is_liked,
        "created_at": review.created_at.isoformat() if review.created_at else None,
        "replies": []  # 暂不实现回复
    }


@router.get("/products/{product_id}/reviews")
async def get_product_reviews(
    product_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    rating: Optional[int] = Query(None, ge=1, le=5, description="按评分筛选"),
    has_image: Optional[bool] = Query(None, description="是否只显示有图评价"),
    sort_by: Optional[str] = Query(None, description="newest, helpful"),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    获取商品评价列表
    """
    # 检查商品
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorMessage.PRODUCT_NOT_FOUND
        )
    
    query = db.query(ProductReview).options(
        joinedload(ProductReview.user),
        joinedload(ProductReview.likes)
    ).filter(
        ProductReview.product_id == product_id,
        ProductReview.is_approved == True
    )
    
    # 评分筛选
    if rating:
        query = query.filter(ProductReview.rating == rating)
    
    # 有图筛选
    if has_image:
        query = query.filter(ProductReview.image_urls.isnot(None))
    
    # 排序
    if sort_by == "helpful":
        query = query.order_by(ProductReview.like_count.desc())
    else:  # newest
        query = query.order_by(ProductReview.created_at.desc())
    
    total = query.count()
    reviews = query.offset((page - 1) * page_size).limit(page_size).all()
    
    current_user_id = current_user.id if current_user else None
    
    return success_response(data={
        "list": [build_review_response(r, current_user_id) for r in reviews],
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total
        }
    })


@router.post("/products/{product_id}/reviews")
async def create_review(
    product_id: int,
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    发表评价
    """
    # 检查商品
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorMessage.PRODUCT_NOT_FOUND
        )
    
    # 检查订单（确保用户购买过该商品）
    order = db.query(Order).filter(
        Order.id == review_data.order_id,
        Order.user_id == current_user.id,
        Order.status.in_(["completed", "shipped"])
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="只有购买并收货后才能评价"
        )
    
    # 检查是否已评价
    existing = db.query(ProductReview).filter(
        ProductReview.product_id == product_id,
        ProductReview.order_id == review_data.order_id,
        ProductReview.user_id == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该商品已评价"
        )
    
    # 创建评价
    review = ProductReview(
        user_id=current_user.id,
        product_id=product_id,
        order_id=review_data.order_id,
        rating=review_data.rating,
        content=review_data.content,
        image_urls=json.dumps(review_data.image_urls) if review_data.image_urls else None
    )
    
    db.add(review)
    db.commit()
    db.refresh(review)
    
    return success_response(message="评价发表成功")


@router.post("/reviews/{review_id}/like")
async def like_review(
    review_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    点赞评价
    """
    review = db.query(ProductReview).filter(ProductReview.id == review_id).first()
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="评价不存在"
        )
    
    # 检查是否已点赞
    existing = db.query(ReviewLike).filter(
        ReviewLike.review_id == review_id,
        ReviewLike.user_id == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="已点赞"
        )
    
    # 创建点赞
    like = ReviewLike(
        review_id=review_id,
        user_id=current_user.id
    )
    db.add(like)
    
    # 更新点赞数
    review.like_count += 1
    
    db.commit()
    
    return success_response(message="点赞成功")


@router.delete("/reviews/{review_id}/like")
async def unlike_review(
    review_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    取消点赞
    """
    like = db.query(ReviewLike).filter(
        ReviewLike.review_id == review_id,
        ReviewLike.user_id == current_user.id
    ).first()
    
    if not like:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="未点赞"
        )
    
    db.delete(like)
    
    # 更新点赞数
    review = db.query(ProductReview).filter(ProductReview.id == review_id).first()
    if review and review.like_count > 0:
        review.like_count -= 1
    
    db.commit()
    
    return success_response(message="取消点赞成功")


@router.get("/reviews/me")
async def get_user_reviews(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    获取当前用户的评价列表
    """
    query = db.query(ProductReview).options(
        joinedload(ProductReview.product),
        joinedload(ProductReview.user),
        joinedload(ProductReview.likes)
    ).filter(
        ProductReview.user_id == current_user.id
    ).order_by(ProductReview.created_at.desc())
    
    total = query.count()
    reviews = query.offset((page - 1) * page_size).limit(page_size).all()
    
    # 构建响应，包含商品信息
    review_list = []
    for r in reviews:
        resp = build_review_response(r, current_user.id)
        # 添加商品信息到响应中
        resp["product"] = {
            "id": r.product.id,
            "name": r.product.name,
            "main_image_url": r.product.main_image_url
        }
        review_list.append(resp)
    
    return success_response(data={
        "list": review_list,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total
        }
    })


# ==================== 管理员评价管理 ====================

@router.get("/admin/reviews")
async def get_admin_reviews(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None, description="pending, approved, rejected"),
    rating: Optional[int] = Query(None, ge=1, le=5),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    获取全部评价列表（管理员）
    """
    query = db.query(ProductReview).options(
        joinedload(ProductReview.product),
        joinedload(ProductReview.user),
        joinedload(ProductReview.likes)
    )
    
    # 状态筛选
    if status == "approved":
        query = query.filter(ProductReview.is_approved == True)
    elif status == "rejected":
        query = query.filter(ProductReview.is_approved == False)
    # pending 暂时不支持，因为目前 is_approved 默认为 True
    
    # 评分筛选
    if rating:
        query = query.filter(ProductReview.rating == rating)
    
    query = query.order_by(ProductReview.created_at.desc())
    
    total = query.count()
    reviews = query.offset((page - 1) * page_size).limit(page_size).all()
    
    review_list = []
    for r in reviews:
        review_list.append({
            "id": r.id,
            "user": {
                "id": r.user.id,
                "username": r.user.username,
                "avatar_url": r.user.avatar_url
            },
            "product": {
                "id": r.product.id,
                "name": r.product.name,
                "main_image_url": r.product.main_image_url
            },
            "rating": r.rating,
            "content": r.content,
            "is_approved": r.is_approved,
            "like_count": r.like_count,
            "created_at": r.created_at.isoformat() if r.created_at else None
        })
    
    return success_response(data={
        "list": review_list,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total
        }
    })


@router.put("/admin/reviews/{review_id}/approve")
async def approve_review(
    review_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    通过评价（管理员）
    """
    review = db.query(ProductReview).filter(ProductReview.id == review_id).first()
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="评价不存在"
        )
    
    review.is_approved = True
    db.commit()
    
    return success_response(message="评价已通过")


@router.put("/admin/reviews/{review_id}/reject")
async def reject_review(
    review_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    拒绝评价（管理员）
    """
    review = db.query(ProductReview).filter(ProductReview.id == review_id).first()
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="评价不存在"
        )
    
    review.is_approved = False
    db.commit()
    
    return success_response(message="评价已拒绝")


@router.delete("/admin/reviews/{review_id}")
async def delete_review(
    review_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    删除评价（管理员）
    """
    review = db.query(ProductReview).filter(ProductReview.id == review_id).first()
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="评价不存在"
        )
    
    db.delete(review)
    db.commit()
    
    return success_response(message="评价已删除")
