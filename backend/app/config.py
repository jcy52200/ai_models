from pydantic_settings import BaseSettings
from functools import lru_cache
import secrets


class Settings(BaseSettings):
    """应用配置"""
    
    # 应用信息
    APP_NAME: str = "素居家具电商 API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # 数据库
    DATABASE_URL: str = "sqlite:///./suju.db"
    
    # JWT 配置
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24小时
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7  # 7天
    
    # CORS 配置
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    # AI Config
    SILICONFLOW_API_KEY: str = ""
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """获取配置单例"""
    return Settings()


settings = get_settings()
