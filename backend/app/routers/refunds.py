"""
退款管理路由（管理员）
"""
from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel

from ..database import get_db
from ..models import User, Refund, Order
from ..utils.response import success_response
from ..dependencies import get_current_admin

router = APIRouter(prefix="/admin/refunds", tags=["退款管理"])


class RefundAction(BaseModel):
    """退款操作请求"""
    admin_notes: Optional[str] = None


@router.get("")
async def get_refunds(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None, description="pending, approved, rejected, completed"),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    获取退款申请列表
    """
    query = db.query(Refund).options(
        joinedload(Refund.order),
        joinedload(Refund.user)
    )
    
    # 状态筛选
    if status:
        query = query.filter(Refund.status == status)
    
    query = query.order_by(Refund.created_at.desc())
    
    total = query.count()
    refunds = query.offset((page - 1) * page_size).limit(page_size).all()
    
    refund_list = []
    for r in refunds:
        refund_list.append({
            "id": r.id,
            "order_id": r.order_id,
            "order_no": r.order.order_no if r.order else None,
            "user": {
                "id": r.user.id,
                "username": r.user.username
            },
            "refund_amount": float(r.refund_amount),
            "reason": r.reason,
            "status": r.status,
            "admin_notes": r.admin_notes,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "processed_at": r.processed_at.isoformat() if r.processed_at else None
        })
    
    return success_response(data={
        "list": refund_list,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total
        }
    })


@router.put("/{refund_id}/approve")
async def approve_refund(
    refund_id: int,
    action: RefundAction,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    批准退款
    """
    refund = db.query(Refund).filter(Refund.id == refund_id).first()
    
    if not refund:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="退款申请不存在"
        )
    
    if refund.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="只能处理待处理的退款申请"
        )
    
    # 更新退款状态
    refund.status = "approved"
    refund.admin_notes = action.admin_notes
    refund.processed_at = datetime.now()
    
    # 更新订单状态
    order = db.query(Order).filter(Order.id == refund.order_id).first()
    if order:
        order.status = "refunded"
    
    db.commit()
    
    return success_response(message="退款已批准")


@router.put("/{refund_id}/reject")
async def reject_refund(
    refund_id: int,
    action: RefundAction,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    拒绝退款
    """
    refund = db.query(Refund).filter(Refund.id == refund_id).first()
    
    if not refund:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="退款申请不存在"
        )
    
    if refund.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="只能处理待处理的退款申请"
        )
    
    # 更新退款状态
    refund.status = "rejected"
    refund.admin_notes = action.admin_notes
    refund.processed_at = datetime.now()
    
    # 恢复订单状态（如果之前被标记为refunded）
    order = db.query(Order).filter(Order.id == refund.order_id).first()
    if order and order.status == "refunded":
        order.status = "completed"  # 恢复为已完成
    
    db.commit()
    
    return success_response(message="退款已拒绝")
