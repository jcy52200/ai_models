from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


# ==================== 评价相关 ====================

class ReviewUser(BaseModel):
    """评价用户信息"""
    id: int
    username: str
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True


class ReviewReplyResponse(BaseModel):
    """评价回复响应"""
    id: int
    user: ReviewUser
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ReviewResponse(BaseModel):
    """评价响应"""
    id: int
    user: ReviewUser
    rating: int
    content: str
    image_urls: Optional[List[str]] = None
    like_count: int
    is_liked: bool = False
    created_at: datetime
    replies: List[ReviewReplyResponse] = []

    class Config:
        from_attributes = True


class ReviewListResponse(BaseModel):
    """评价列表响应"""
    list: List[ReviewResponse]
    pagination: dict


class ReviewCreate(BaseModel):
    """创建评价请求"""
    order_id: int
    rating: int = Field(..., ge=1, le=5)
    content: str = Field(..., min_length=1)
    image_urls: Optional[List[str]] = None


class ReviewsSummary(BaseModel):
    """评价统计"""
    total: int
    average_rating: float
    rating_5: int
    rating_4: int
    rating_3: int
    rating_2: int
    rating_1: int
