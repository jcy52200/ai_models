from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


# ==================== 用户相关 ====================

class UserBase(BaseModel):
    """用户基础模型"""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr


class UserCreate(UserBase):
    """用户注册请求"""
    password: str = Field(..., min_length=6, max_length=32)
    phone: Optional[str] = None
    secret_key: Optional[str] = None


class UserLogin(BaseModel):
    """用户登录请求"""
    account: str = Field(..., description="用户名或邮箱")
    password: str


class UserUpdate(BaseModel):
    """用户信息更新请求"""
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    avatar_url: Optional[str] = None
    phone: Optional[str] = None


class PasswordUpdate(BaseModel):
    """密码更新请求"""
    old_password: str
    new_password: str = Field(..., min_length=6, max_length=32)


class PasswordResetRequest(BaseModel):
    """密码重置请求（验证身份）"""
    email: EmailStr


class PasswordReset(BaseModel):
    """密码重置确认"""
    email: EmailStr
    new_password: str = Field(..., min_length=6, max_length=32)


class UserResponse(BaseModel):
    """用户响应"""
    id: int
    username: str
    email: str
    avatar_url: Optional[str] = None
    phone: Optional[str] = None
    is_admin: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class UserWithToken(BaseModel):
    """用户信息带 Token"""
    user: UserResponse
    token: str


class TokenResponse(BaseModel):
    """Token 响应"""
    token: str


# ==================== 地址相关 ====================

class AddressBase(BaseModel):
    """地址基础模型"""
    recipient_name: str = Field(..., max_length=50)
    phone: str = Field(..., max_length=20)
    province: str = Field(..., max_length=50)
    city: str = Field(..., max_length=50)
    district: str = Field(..., max_length=50)
    detail_address: str


class AddressCreate(AddressBase):
    """创建地址请求"""
    is_default: bool = False


class AddressUpdate(AddressBase):
    """更新地址请求"""
    is_default: Optional[bool] = None


class AddressResponse(AddressBase):
    """地址响应"""
    id: int
    is_default: bool
    created_at: datetime

    class Config:
        from_attributes = True
