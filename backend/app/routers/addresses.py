from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, UserAddress
from ..schemas import AddressCreate, AddressUpdate, AddressResponse
from ..utils.response import success_response, ErrorMessage
from ..dependencies import get_current_user

router = APIRouter(prefix="/users/addresses", tags=["地址管理"])


@router.get("")
async def get_addresses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    获取用户地址列表
    """
    addresses = db.query(UserAddress).filter(
        UserAddress.user_id == current_user.id
    ).order_by(UserAddress.is_default.desc(), UserAddress.created_at.desc()).all()
    
    return success_response(
        data=[AddressResponse.model_validate(addr).model_dump() for addr in addresses]
    )


@router.post("")
async def create_address(
    address_data: AddressCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    添加新地址
    """
    # 如果设为默认，先取消其他默认地址
    if address_data.is_default:
        db.query(UserAddress).filter(
            UserAddress.user_id == current_user.id,
            UserAddress.is_default == True
        ).update({"is_default": False})
    
    # 创建地址
    address = UserAddress(
        user_id=current_user.id,
        recipient_name=address_data.recipient_name,
        phone=address_data.phone,
        province=address_data.province,
        city=address_data.city,
        district=address_data.district,
        detail_address=address_data.detail_address,
        is_default=address_data.is_default
    )
    
    db.add(address)
    db.commit()
    db.refresh(address)
    
    return success_response(
        data=AddressResponse.model_validate(address).model_dump(),
        message="地址添加成功"
    )


@router.put("/{address_id}")
async def update_address(
    address_id: int,
    address_data: AddressUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    更新地址
    """
    address = db.query(UserAddress).filter(
        UserAddress.id == address_id,
        UserAddress.user_id == current_user.id
    ).first()
    
    if not address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorMessage.ADDRESS_NOT_FOUND
        )
    
    # 如果设为默认，先取消其他默认地址
    if address_data.is_default:
        db.query(UserAddress).filter(
            UserAddress.user_id == current_user.id,
            UserAddress.is_default == True,
            UserAddress.id != address_id
        ).update({"is_default": False})
    
    # 更新字段
    address.recipient_name = address_data.recipient_name
    address.phone = address_data.phone
    address.province = address_data.province
    address.city = address_data.city
    address.district = address_data.district
    address.detail_address = address_data.detail_address
    if address_data.is_default is not None:
        address.is_default = address_data.is_default
    
    db.commit()
    db.refresh(address)
    
    return success_response(
        data=AddressResponse.model_validate(address).model_dump(),
        message="地址更新成功"
    )


@router.delete("/{address_id}")
async def delete_address(
    address_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    删除地址
    """
    address = db.query(UserAddress).filter(
        UserAddress.id == address_id,
        UserAddress.user_id == current_user.id
    ).first()
    
    if not address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorMessage.ADDRESS_NOT_FOUND
        )
    
    db.delete(address)
    db.commit()
    
    return success_response(message="地址删除成功")


@router.put("/{address_id}/default")
async def set_default_address(
    address_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    设置默认地址
    """
    address = db.query(UserAddress).filter(
        UserAddress.id == address_id,
        UserAddress.user_id == current_user.id
    ).first()
    
    if not address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorMessage.ADDRESS_NOT_FOUND
        )
    
    # 取消其他默认地址
    db.query(UserAddress).filter(
        UserAddress.user_id == current_user.id,
        UserAddress.is_default == True
    ).update({"is_default": False})
    
    # 设置当前地址为默认
    address.is_default = True
    db.commit()
    
    return success_response(message="默认地址设置成功")
