from pydantic import BaseModel
from datetime import datetime
from .product import ProductListItem

class FavoriteBase(BaseModel):
    product_id: int

class FavoriteCreate(FavoriteBase):
    pass

class Favorite(BaseModel):
    id: int
    user_id: int
    product_id: int
    created_at: datetime
    product: ProductListItem | None = None

    class Config:
        from_attributes = True
