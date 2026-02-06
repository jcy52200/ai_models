from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models import User, Order, Product, ProductReview
from ..dependencies import get_current_admin
from ..utils.response import success_response

router = APIRouter(prefix="/admin", tags=["管理后台"])

@router.get("/dashboard")
async def get_dashboard_stats(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    获取管理后台仪表盘统计数据
    """
    # 统计数据
    total_users = db.query(User).count()
    total_products = db.query(Product).count()
    total_orders = db.query(Order).count()
    
    # 计算总销售额 (这就简单计算所有已支付订单的总金额)
    # 假设状态为 'paid', 'shipped', 'completed' 的都算
    total_sales = db.query(func.sum(Order.total_amount)).filter(
        Order.status.in_(['paid', 'shipped', 'completed'])
    ).scalar() or 0.0
    
    # 待处理订单数
    pending_orders = db.query(Order).filter(Order.status == 'paid').count()
    
    # 待审核评价数
    pending_reviews = db.query(ProductReview).filter(ProductReview.is_approved == False).count()

    # Calculate sales trend (Last 7 days)
    from datetime import datetime, timedelta
    today = datetime.now().date()
    sales_data = []
    
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_start = datetime.combine(day, datetime.min.time())
        day_end = datetime.combine(day, datetime.max.time())
        
        daily_sales = db.query(func.sum(Order.total_amount)).filter(
            Order.created_at >= day_start,
            Order.created_at <= day_end,
            Order.status.in_(['paid', 'shipped', 'completed'])
        ).scalar() or 0.0
        
        # Weekday name in Chinese
        weekdays = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
        weekday = weekdays[day.weekday()]
        
        sales_data.append({
            "name": weekday if i < 6 else "今天",
            "sales": float(daily_sales)
        })

    return success_response({
        "total_users": total_users,
        "total_products": total_products,
        "total_orders": total_orders,
        "total_sales": float(total_sales),
        "pending_orders": pending_orders,
        "pending_reviews": pending_reviews,
        "sales_data": sales_data
    })
