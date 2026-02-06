from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from ..database import get_db
from ..models.favorite import Favorite
from ..models.product import Product
from ..schemas.favorite import Favorite as FavoriteSchema
from ..dependencies import get_current_user
from ..models.user import User

router = APIRouter(
    prefix="/favorites",
    tags=["favorites"]
)

@router.post("/{product_id}", response_model=Dict[str, Any])
def toggle_favorite(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """切换收藏状态（添加/取消）"""
    # 检查商品是否存在
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="商品不存在"
        )

    # 检查是否已收藏
    favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.product_id == product_id
    ).first()

    if favorite:
        # 取消收藏
        db.delete(favorite)
        db.commit()
        return {"is_favorite": False, "message": "已取消收藏"}
    else:
        # 添加收藏
        new_favorite = Favorite(user_id=current_user.id, product_id=product_id)
        db.add(new_favorite)
        db.commit()
        return {"is_favorite": True, "message": "已添加收藏"}

@router.get("", response_model=List[FavoriteSchema])
def get_favorites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取用户的收藏列表"""
    favorites = db.query(Favorite).filter(
        Favorite.user_id == current_user.id
    ).order_by(Favorite.created_at.desc()).all()
    return favorites

@router.get("/{product_id}/check", response_model=Dict[str, bool])
def check_favorite_status(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """检查商品是否已收藏"""
    favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.product_id == product_id
    ).first()
    return {"is_favorite": favorite is not None}
