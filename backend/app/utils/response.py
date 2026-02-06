from typing import Any, Optional, Dict, List, Union
from pydantic import BaseModel


class ApiResponse(BaseModel):
    """统一 API 响应格式"""
    code: int = 200
    message: str = "success"
    data: Optional[Any] = None
    errors: Optional[Dict[str, List[str]]] = None


def success_response(
    data: Any = None,
    message: str = "success",
    code: int = 200
) -> dict:
    """
    构建成功响应
    
    Args:
        data: 响应数据
        message: 响应消息
        code: 状态码
    
    Returns:
        响应字典
    """
    return {
        "code": code,
        "message": message,
        "data": data
    }


def error_response(
    message: str,
    code: int = 400,
    errors: Optional[Dict[str, List[str]]] = None
) -> dict:
    """
    构建错误响应
    
    Args:
        message: 错误消息
        code: 错误码
        errors: 详细错误信息
    
    Returns:
        响应字典
    """
    response = {
        "code": code,
        "message": message
    }
    
    if errors:
        response["errors"] = errors
    
    return response


# 常用错误码
class ErrorCode:
    SUCCESS = 200
    BAD_REQUEST = 400
    UNAUTHORIZED = 401
    FORBIDDEN = 403
    NOT_FOUND = 404
    CONFLICT = 409
    VALIDATION_ERROR = 422
    TOO_MANY_REQUESTS = 429
    INTERNAL_ERROR = 500


# 常用错误消息
class ErrorMessage:
    INVALID_CREDENTIALS = "用户名或密码错误"
    USER_NOT_FOUND = "用户不存在"
    USER_EXISTS = "用户名或邮箱已存在"
    EMAIL_EXISTS = "邮箱已被注册"
    USERNAME_EXISTS = "用户名已被使用"
    TOKEN_INVALID = "Token无效或已过期"
    TOKEN_EXPIRED = "Token已过期"
    UNAUTHORIZED = "未授权访问"
    FORBIDDEN = "权限不足"
    NOT_FOUND = "资源不存在"
    VALIDATION_ERROR = "参数验证失败"
    PASSWORD_WRONG = "原密码错误"
    PRODUCT_NOT_FOUND = "商品不存在"
    OUT_OF_STOCK = "库存不足"
    ORDER_NOT_FOUND = "订单不存在"
    ADDRESS_NOT_FOUND = "地址不存在"
    CART_EMPTY = "购物车为空"
    CANNOT_CANCEL_ORDER = "无法取消该订单"
