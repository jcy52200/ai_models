from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import UserCreate, UserLogin, UserResponse, UserWithToken, TokenResponse, PasswordResetRequest, PasswordReset
from ..utils.security import hash_password, verify_password, create_access_token, create_refresh_token, verify_token
from ..utils.response import success_response, error_response, ErrorMessage
from ..dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["认证"])


@router.post("/register")
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    用户注册
    
    - **username**: 用户名，3-50字符
    - **email**: 邮箱
    - **password**: 密码，6-32字符
    - **phone**: 手机号（可选）
    """
    # 检查用户名是否已存在
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=ErrorMessage.USERNAME_EXISTS
        )
    
    # 检查邮箱是否已存在
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=ErrorMessage.EMAIL_EXISTS
        )
    
    # 检查是否注册为管理员
    is_admin = False
    if user_data.secret_key and user_data.secret_key == "suju_admin_2026":
        is_admin = True

    # 创建用户
    user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        phone=user_data.phone,
        is_admin=is_admin
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # 生成 Token
    role = "admin" if is_admin else "user"
    token = create_access_token({"sub": str(user.id), "role": role})
    
    return success_response(
        data={
            "user": {**UserResponse.model_validate(user).model_dump(), "role": role},
            "token": token
        },
        message="注册成功"
    )


@router.post("/login")
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """
    用户登录
    
    - **account**: 用户名或邮箱
    - **password**: 密码
    """
    # 查找用户（支持用户名或邮箱登录）
    user = db.query(User).filter(
        (User.username == login_data.account) | (User.email == login_data.account)
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=ErrorMessage.INVALID_CREDENTIALS
        )
    
    # 验证密码
    if not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=ErrorMessage.INVALID_CREDENTIALS
        )
    
    # 检查用户状态
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="用户已被禁用"
        )
    
    # 生成 Token
    role = "admin" if user.is_admin else "user"
    token = create_access_token({"sub": str(user.id), "role": role})
    
    return success_response(
        data={
            "user": {**UserResponse.model_validate(user).model_dump(), "role": role},
            "token": token
        },
        message="登录成功"
    )


@router.post("/refresh")
async def refresh_token(current_user: User = Depends(get_current_user)):
    """
    刷新 Token
    
    需要在 Header 中提供有效的 Bearer Token
    """
    # 生成新 Token
    role = "admin" if current_user.is_admin else "user"
    new_token = create_access_token({"sub": str(current_user.id), "role": role})
    
    return success_response(
        data={"token": new_token},
        message="刷新成功"
    )


@router.post("/password-reset-request")
async def password_reset_request(data: PasswordResetRequest, db: Session = Depends(get_db)):
    """
    密码重置请求（简化版，仅验证邮箱是否存在）
    
    - **email**: 注册时使用的邮箱
    """
    user = db.query(User).filter(User.email == data.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="该邮箱未注册"
        )
    
    # 简化方案：直接返回成功，前端可以进入下一步设置新密码
    return success_response(
        data={"email": data.email},
        message="邮箱验证成功，请设置新密码"
    )


@router.post("/password-reset")
async def password_reset(data: PasswordReset, db: Session = Depends(get_db)):
    """
    密码重置确认
    
    - **email**: 邮箱
    - **new_password**: 新密码
    """
    user = db.query(User).filter(User.email == data.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="该邮箱未注册"
        )
    
    # 更新密码
    user.password_hash = hash_password(data.new_password)
    db.commit()
    
    return success_response(
        message="密码重置成功，请使用新密码登录"
    )
