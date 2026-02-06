from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List
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
    
    # CORS 配置 - 支持从环境变量读取，逗号分隔多个域名
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    # AI Config
    SILICONFLOW_API_KEY: str = ""
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        
        @classmethod
        def parse_env_var(cls, field_name: str, raw_val: str):
            """解析环境变量，支持特定字段的特殊格式"""
            if field_name == "CORS_ORIGINS":
                # 支持逗号分隔的多个域名
                return [origin.strip() for origin in raw_val.split(",") if origin.strip()]
            return cls.json_loads(raw_val)


@lru_cache()
def get_settings() -> Settings:
    """获取配置单例"""
    return Settings()


settings = get_settings()
