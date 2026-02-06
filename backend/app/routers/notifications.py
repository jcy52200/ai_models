"""
通知路由
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from ..database import get_db
from ..models import User, Notification
from ..utils.response import success_response
from ..dependencies import get_current_user

router = APIRouter(prefix="/notifications", tags=["通知"])


@router.get("")
async def get_notifications(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    获取当前用户的通知列表
    """
    # 查询全局通知(user_id=None)或用户个人通知
    query = db.query(Notification).filter(
        or_(
            Notification.user_id == None,
            Notification.user_id == current_user.id
        )
    ).order_by(Notification.created_at.desc())
    
    total = query.count()
    notifications = query.offset((page - 1) * page_size).limit(page_size).all()
    
    notification_list = []
    for n in notifications:
        notification_list.append({
            "id": n.id,
            "type": n.type,
            "title": n.title,
            "content": n.content,
            "related_id": n.related_id,
            "related_image": n.related_image,
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat() if n.created_at else None
        })
    
    return success_response(data={
        "list": notification_list,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total
        }
    })


@router.get("/unread-count")
async def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    获取未读通知数量
    """
    count = db.query(Notification).filter(
        or_(
            Notification.user_id == None,
            Notification.user_id == current_user.id
        ),
        Notification.is_read == False
    ).count()
    
    return success_response(data={"count": count})


@router.put("/{notification_id}/read")
async def mark_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    标记通知为已读
    """
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        or_(
            Notification.user_id == None,
            Notification.user_id == current_user.id
        )
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="通知不存在"
        )
    
    notification.is_read = True
    db.commit()
    
    return success_response(message="已标记为已读")


@router.put("/read-all")
async def mark_all_as_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    标记所有通知为已读
    """
    db.query(Notification).filter(
        or_(
            Notification.user_id == None,
            Notification.user_id == current_user.id
        ),
        Notification.is_read == False
    ).update({"is_read": True}, synchronize_session=False)
    
    db.commit()
    
    return success_response(message="已全部标记为已读")
