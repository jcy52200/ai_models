from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from .config import settings
from .database import init_db
from .routers import (
    auth_router,
    users_router,
    addresses_router,
    categories_router,
    products_router,
    cart_router,
    orders_router,
    reviews_router,
    refunds_router,
    notifications_router,
    dashboard_router,
    upload_router,
    favorites_router,
    ai_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时初始化数据库
    # 启动时初始化数据库
    init_db()
    
    # 简单的自动迁移逻辑 (确保Product表字段存在)
    try:
        import sqlite3
        conn = sqlite3.connect('suju.db')
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(products)")
        columns = [row[1] for row in cursor.fetchall()]
        
        if 'is_top' not in columns:
            cursor.execute("ALTER TABLE products ADD COLUMN is_top BOOLEAN DEFAULT 0")
        if 'is_published' not in columns:
            cursor.execute("ALTER TABLE products ADD COLUMN is_published BOOLEAN DEFAULT 1")
        if 'sales_count' not in columns:
            cursor.execute("ALTER TABLE products ADD COLUMN sales_count INTEGER DEFAULT 0")
        if 'view_count' not in columns:
            cursor.execute("ALTER TABLE products ADD COLUMN view_count INTEGER DEFAULT 0")
            
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Migration warning: {e}")
    yield
    # 关闭时清理资源


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="素居家具电商后端 API",
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 全局异常处理
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """全局异常处理器"""
    return JSONResponse(
        status_code=500,
        content={
            "code": 500,
            "message": f"服务器内部错误: {str(exc)}" if settings.DEBUG else "服务器内部错误"
        }
    )


# 注册路由
app.include_router(auth_router, prefix="/v1")
app.include_router(users_router, prefix="/v1")
app.include_router(addresses_router, prefix="/v1")
app.include_router(categories_router, prefix="/v1")
app.include_router(products_router, prefix="/v1")
app.include_router(cart_router, prefix="/v1")
app.include_router(orders_router, prefix="/v1")
app.include_router(reviews_router, prefix="/v1")
app.include_router(refunds_router, prefix="/v1")
app.include_router(notifications_router, prefix="/v1")
app.include_router(dashboard_router, prefix="/v1")
app.include_router(upload_router, prefix="/v1")
app.include_router(favorites_router, prefix="/v1")
app.include_router(ai_router, prefix="/v1")


# 健康检查
@app.get("/health")
async def health_check():
    """健康检查接口"""
    return {"status": "ok", "version": settings.APP_VERSION}


@app.get("/")
async def root():
    """根路径"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
