import os
import uuid
import shutil
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from ..utils.response import success_response, ErrorMessage
from ..dependencies import get_current_user
from ..models import User

router = APIRouter(prefix="/upload", tags=["文件上传"])

# 配置上传目录 (相对于 backend 运行目录)
UPLOAD_DIR = "../frontend/public/uploads"

# 确保目录存在
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("")
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    上传文件 (登录用户)
    保存至 frontend/public/uploads
    返回 URL: /uploads/{filename}
    """
    # 验证文件类型
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="只能上传图片文件")
    
    # 生成唯一文件名
    ext = os.path.splitext(file.filename)[1]
    filename = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{uuid.uuid4().hex[:8]}{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    try:
        # 保存文件
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # 返回相对路径 (前端可访问的路径)
        url = f"/uploads/{filename}"
        
        return success_response(
            data={"url": url},
            message="上传成功"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"上传失败: {str(e)}")
