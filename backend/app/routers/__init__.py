from .auth import router as auth_router
from .users import router as users_router
from .addresses import router as addresses_router
from .categories import router as categories_router
from .products import router as products_router
from .cart import router as cart_router
from .orders import router as orders_router
from .reviews import router as reviews_router
from .refunds import router as refunds_router
from .notifications import router as notifications_router
from .dashboard import router as dashboard_router
from .upload import router as upload_router
from .favorites import router as favorites_router
from .ai import router as ai_router

__all__ = [
    "auth_router",
    "users_router",
    "addresses_router",
    "categories_router",
    "products_router",
    "cart_router",
    "orders_router",
    "reviews_router",
    "refunds_router",
    "notifications_router",
    "dashboard_router",
    "upload_router",
    "favorites_router",
    "ai_router",
]
