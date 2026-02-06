from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Category, User
from ..schemas import CategoryResponse, CategoryCreate, CategoryUpdate
from ..utils.response import success_response
from ..dependencies import get_current_admin

router = APIRouter(prefix="/categories", tags=["商品分类"])


def build_category_tree(categories: List[Category], parent_id: int = 0) -> List[dict]:
    """递归构建分类树"""
    result = []
    for category in categories:
        if category.parent_id == parent_id:
            children = build_category_tree(categories, category.id)
            cat_dict = CategoryResponse.model_validate(category).model_dump()
            if children:
                cat_dict["children"] = children
            result.append(cat_dict)
    return result


@router.get("")
async def get_categories(
    parent_id: Optional[int] = Query(None, description="父分类ID，0表示顶级分类"),
    is_active: Optional[bool] = Query(None, description="是否只显示启用分类"),
    db: Session = Depends(get_db)
):
    """
    获取分类列表
    
    - **parent_id**: 父分类ID，0表示顶级分类
    - **is_active**: 是否只显示启用分类
    """
    query = db.query(Category)
    
    if is_active is not None:
        query = query.filter(Category.is_active == is_active)
    
    categories = query.order_by(Category.sort_order, Category.id).all()
    
    # 如果指定了 parent_id，只返回该分类的子分类
    if parent_id is not None:
        categories = [c for c in categories if c.parent_id == parent_id]
        return success_response(
            data=[CategoryResponse.model_validate(c).model_dump() for c in categories]
        )
    
    # 构建分类树
    tree = build_category_tree(categories, 0)
    
    return success_response(data=tree)


@router.get("/{category_id}")
async def get_category(
    category_id: int,
    db: Session = Depends(get_db)
):
    """
    获取分类详情
    """
    category = db.query(Category).filter(Category.id == category_id).first()
    
    if not category:
        return success_response(data=None, message="分类不存在", code=404)
    
    # 获取子分类
    children = db.query(Category).filter(Category.parent_id == category_id).all()
    
    result = CategoryResponse.model_validate(category).model_dump()
    if children:
        result["children"] = [CategoryResponse.model_validate(c).model_dump() for c in children]
    
    return success_response(data=result)


@router.post("")
async def create_category(
    category_data: CategoryCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    创建分类（管理员）
    """
    # 检查名称是否重复
    if db.query(Category).filter(Category.name == category_data.name).first():
        return success_response(code=400, message="分类名称已存在")
    
    category = Category(**category_data.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    
    return success_response(
        data=CategoryResponse.model_validate(category).model_dump(),
        message="分类创建成功"
    )


@router.put("/{category_id}")
async def update_category(
    category_id: int,
    category_data: CategoryUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    更新分类（管理员）
    """
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        return success_response(code=404, message="分类不存在")
    
    update_dict = category_data.model_dump(exclude_unset=True)
    
    # 如果修改名称，检查重复
    if "name" in update_dict and update_dict["name"] != category.name:
        if db.query(Category).filter(Category.name == update_dict["name"]).first():
            return success_response(code=400, message="分类名称已存在")
            
    for key, value in update_dict.items():
        setattr(category, key, value)
        
    db.commit()
    db.refresh(category)
    
    return success_response(
        data=CategoryResponse.model_validate(category).model_dump(),
        message="分类更新成功"
    )


@router.delete("/{category_id}")
async def delete_category(
    category_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    删除分类（管理员）
    """
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        return success_response(code=404, message="分类不存在")
    
    # 检查是否有子分类
    if db.query(Category).filter(Category.parent_id == category_id).first():
        return success_response(code=400, message="请先删除子分类")
        
    # 检查是否有商品关联 (可选，根据需求确定是否允许强制删除或级联)
    # 这里简单检查
    if category.products:
        return success_response(code=400, message="该分类下还有商品，无法删除")
    
    db.delete(category)
    db.commit()
    
    return success_response(message="分类删除成功")
