from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import UserResponse, UserUpdate, PasswordUpdate
from ..utils.security import hash_password, verify_password
from ..utils.response import success_response, ErrorMessage
from ..dependencies import get_current_user, get_current_admin

router = APIRouter(prefix="/users", tags=["用户"])


@router.get("")
async def get_users(
    page: int = 1,
    page_size: int = 20,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    获取用户列表（管理员）
    """
    total = db.query(User).count()
    users = db.query(User).order_by(User.id.desc()).offset((page - 1) * page_size).limit(page_size).all()
    
    return success_response({
        "list": [UserResponse.model_validate(u).model_dump() for u in users],
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": (total + page_size - 1) // page_size
        }
    })


@router.get("/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    获取当前用户信息
    """
    return success_response(
        data=UserResponse.model_validate(current_user).model_dump()
    )


@router.put("/me")
async def update_current_user(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    更新当前用户信息
    
    - **username**: 用户名（可选）
    - **avatar_url**: 头像URL（可选）
    - **phone**: 手机号（可选）
    """
    # 检查用户名是否已被其他用户使用
    if user_data.username and user_data.username != current_user.username:
        if db.query(User).filter(User.username == user_data.username).first():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=ErrorMessage.USERNAME_EXISTS
            )
        current_user.username = user_data.username
    
    # 更新其他字段
    if user_data.avatar_url is not None:
        current_user.avatar_url = user_data.avatar_url
    if user_data.phone is not None:
        current_user.phone = user_data.phone
    
    db.commit()
    db.refresh(current_user)
    
    return success_response(
        data=UserResponse.model_validate(current_user).model_dump(),
        message="更新成功"
    )


@router.put("/me/password")
async def update_password(
    password_data: PasswordUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    修改密码
    
    - **old_password**: 原密码
    - **new_password**: 新密码，6-32字符
    """
    # 验证原密码
    if not verify_password(password_data.old_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ErrorMessage.INVALID_PASSWORD
        )
    
    # 更新密码
    current_user.password_hash = hash_password(password_data.new_password)
    db.commit()
    
    return success_response(message="密码修改成功")


@router.put("/{user_id}")
async def update_user_by_admin(
    user_id: int,
    user_data: UserUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    管理员更新用户信息
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorMessage.USER_NOT_FOUND
        )
        
    if user_data.username and user_data.username != user.username:
        if db.query(User).filter(User.username == user_data.username).first():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=ErrorMessage.USERNAME_EXISTS
            )
        user.username = user_data.username
        
    if user_data.avatar_url is not None:
        user.avatar_url = user_data.avatar_url
    if user_data.phone is not None:
        user.phone = user_data.phone
        
    db.commit()
    db.refresh(user)
    
    return success_response(
        data=UserResponse.model_validate(user).model_dump(),
        message="更新成功"
    )


@router.delete("/{user_id}")
async def delete_user_by_admin(
    user_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    管理员删除用户
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorMessage.USER_NOT_FOUND
        )
        
    # 不能删除自己
    if user.id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="不能删除自己"
        )
        
    db.delete(user)
    db.commit()
    
    return success_response(message="用户已删除")
