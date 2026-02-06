import sys
import os

# 将 backend 目录添加到 sys.path，以便导入 app 模块
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.user import User

def set_user_admin(username_or_email):
    db = SessionLocal()
    try:
        user = db.query(User).filter(
            (User.username == username_or_email) | (User.email == username_or_email)
        ).first()
        
        if not user:
            print(f"User {username_or_email} not found.")
            return

        user.is_admin = True
        db.commit()
        print(f"Successfully set {user.username} (ID: {user.id}) as admin.")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.path) < 2:
        username = input("Enter username or email to promote to admin: ")
    else:
        # 如果没有命令行参数，也提示输入
        # 这里为了简单，直接交互式
        pass

    if len(sys.argv) > 1:
        username = sys.argv[1]
    else:
         username = input("Enter username or email to promote to admin: ")

    set_user_admin(username)
