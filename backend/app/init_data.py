"""
初始化测试数据脚本

运行方式: python -m app.init_data
"""
import json
from decimal import Decimal

from .database import SessionLocal, init_db
from .models import User, Category, Tag, Product, ProductTag, ProductParam
from .utils.security import hash_password


def init_test_data():
    """初始化测试数据"""
    init_db()
    db = SessionLocal()
    
    try:
        # 检查是否已有数据
        if db.query(User).first():
            print("数据库已有数据，跳过初始化")
            return
        
        print("开始初始化测试数据...")
        
        # 1. 创建管理员用户
        admin = User(
            username="admin",
            email="admin@suju.com",
            password_hash=hash_password("admin123"),
            is_admin=True
        )
        db.add(admin)
        
        # 创建测试用户
        test_user = User(
            username="testuser",
            email="test@suju.com",
            password_hash=hash_password("test123"),
            phone="13800138000"
        )
        db.add(test_user)
        
        # 2. 创建商品分类
        categories_data = [
            {"name": "客厅", "description": "沙发、茶几、电视柜等", "sort_order": 1},
            {"name": "餐厅", "description": "餐桌、餐椅、餐边柜等", "sort_order": 2},
            {"name": "卧室", "description": "床、床垫、衣柜、床头柜等", "sort_order": 3},
            {"name": "书房", "description": "书桌、书柜、办公椅等", "sort_order": 4},
        ]
        
        categories = {}
        for cat_data in categories_data:
            cat = Category(**cat_data)
            db.add(cat)
            db.flush()
            categories[cat_data["name"]] = cat
        
        # 3. 创建商品标签
        tags_data = [
            {"name": "新品", "color": "#000000"},
            {"name": "热销", "color": "#E53E3E"},
            {"name": "特惠", "color": "#38A169"},
            {"name": "限量", "color": "#805AD5"},
        ]
        
        tags = {}
        for tag_data in tags_data:
            tag = Tag(**tag_data)
            db.add(tag)
            db.flush()
            tags[tag_data["name"]] = tag
        
        # 4. 创建商品
        products_data = [
            {
                "name": "北欧布艺沙发",
                "short_description": "舒适简约，现代家居首选",
                "description": "<p>采用高密度海绵填充，久坐不塌陷。优质棉麻面料，透气亲肤。实木框架，稳固耐用。</p>",
                "price": Decimal("1299.00"),
                "original_price": Decimal("1599.00"),
                "stock": 100,
                "category": "客厅",
                "main_image_url": "/product-1.jpg",
                "image_urls": ["/product-1.jpg", "/product-1-2.jpg", "/product-1-3.jpg"],
                "is_top": True,
                "sales_count": 500,
                "view_count": 2000,
                "tags": ["热销", "特惠"],
                "params": [
                    {"name": "尺寸", "value": "200×90×85cm"},
                    {"name": "材质", "value": "优质棉麻+实木框架"},
                    {"name": "颜色", "value": "灰色/米色/蓝色"},
                ]
            },
            {
                "name": "极简木质茶几",
                "short_description": "日式原木设计，简约不简单",
                "description": "<p>北美进口白橡木，天然木纹纹理。圆润边角设计，呵护家人安全。</p>",
                "price": Decimal("899.00"),
                "original_price": Decimal("1099.00"),
                "stock": 80,
                "category": "客厅",
                "main_image_url": "/product-2.jpg",
                "image_urls": ["/product-2.jpg"],
                "is_top": True,
                "sales_count": 320,
                "view_count": 1500,
                "tags": ["新品"],
                "params": [
                    {"name": "尺寸", "value": "120×60×45cm"},
                    {"name": "材质", "value": "北美白橡木"},
                    {"name": "颜色", "value": "原木色"},
                ]
            },
            {
                "name": "天鹅绒休闲椅",
                "short_description": "轻奢设计，品质生活",
                "description": "<p>意大利进口天鹅绒面料，丝滑触感。人体工学设计，完美贴合身体曲线。</p>",
                "price": Decimal("1599.00"),
                "original_price": None,
                "stock": 50,
                "category": "客厅",
                "main_image_url": "/product-3.jpg",
                "image_urls": ["/product-3.jpg"],
                "is_top": True,
                "sales_count": 180,
                "view_count": 800,
                "tags": ["新品", "限量"],
                "params": [
                    {"name": "尺寸", "value": "75×70×85cm"},
                    {"name": "材质", "value": "天鹅绒+金属脚"},
                    {"name": "颜色", "value": "深绿色/酒红色"},
                ]
            },
            {
                "name": "现代落地灯",
                "short_description": "艺术照明，点亮空间",
                "price": Decimal("699.00"),
                "original_price": Decimal("899.00"),
                "stock": 120,
                "category": "客厅",
                "main_image_url": "/product-4.jpg",
                "image_urls": ["/product-4.jpg"],
                "is_top": False,
                "sales_count": 250,
                "view_count": 1000,
                "tags": ["热销"],
                "params": [
                    {"name": "尺寸", "value": "高160cm"},
                    {"name": "材质", "value": "大理石底座+金属杆"},
                    {"name": "光源", "value": "LED可调光"},
                ]
            },
            {
                "name": "实木餐桌",
                "short_description": "全实木打造，健康环保",
                "price": Decimal("2299.00"),
                "original_price": Decimal("2799.00"),
                "stock": 40,
                "category": "餐厅",
                "main_image_url": "/product-5.jpg",
                "image_urls": ["/product-5.jpg"],
                "is_top": True,
                "sales_count": 150,
                "view_count": 600,
                "tags": ["特惠"],
                "params": [
                    {"name": "尺寸", "value": "140×80×75cm"},
                    {"name": "材质", "value": "北美黑胡桃木"},
                    {"name": "适用人数", "value": "4-6人"},
                ]
            },
            {
                "name": "设计师餐椅",
                "short_description": "经典设计，永不过时",
                "price": Decimal("499.00"),
                "original_price": None,
                "stock": 200,
                "category": "餐厅",
                "main_image_url": "/product-6.jpg",
                "image_urls": ["/product-6.jpg"],
                "is_top": False,
                "sales_count": 400,
                "view_count": 900,
                "tags": ["热销"],
                "params": [
                    {"name": "尺寸", "value": "45×52×82cm"},
                    {"name": "材质", "value": "PP塑料+实木脚"},
                    {"name": "颜色", "value": "白色/黑色/灰色"},
                ]
            },
            {
                "name": "软包双人床",
                "short_description": "云朵般的睡眠体验",
                "price": Decimal("3299.00"),
                "original_price": Decimal("3999.00"),
                "stock": 30,
                "category": "卧室",
                "main_image_url": "/product-7.jpg",
                "image_urls": ["/product-7.jpg"],
                "is_top": True,
                "sales_count": 100,
                "view_count": 500,
                "tags": ["新品", "特惠"],
                "params": [
                    {"name": "尺寸", "value": "180×200cm（1.8米床）"},
                    {"name": "材质", "value": "科技布+高密度海绵"},
                    {"name": "颜色", "value": "米白色/浅灰色"},
                ]
            },
            {
                "name": "简约书桌",
                "short_description": "高效办公，专注学习",
                "price": Decimal("799.00"),
                "original_price": Decimal("999.00"),
                "stock": 60,
                "category": "书房",
                "main_image_url": "/product-8.jpg",
                "image_urls": ["/product-8.jpg"],
                "is_top": False,
                "sales_count": 220,
                "view_count": 700,
                "tags": ["热销"],
                "params": [
                    {"name": "尺寸", "value": "120×60×75cm"},
                    {"name": "材质", "value": "E0级环保板材"},
                    {"name": "颜色", "value": "橡木色/胡桃色"},
                ]
            },
        ]
        
        for prod_data in products_data:
            # 获取分类
            category = categories.get(prod_data.pop("category"))
            prod_tags = prod_data.pop("tags", [])
            prod_params = prod_data.pop("params", [])
            
            # 处理 image_urls
            if "image_urls" in prod_data:
                prod_data["image_urls"] = json.dumps(prod_data["image_urls"])
            
            # 创建商品
            product = Product(
                category_id=category.id if category else 1,
                **prod_data
            )
            db.add(product)
            db.flush()
            
            # 添加标签关联
            for tag_name in prod_tags:
                tag = tags.get(tag_name)
                if tag:
                    pt = ProductTag(product_id=product.id, tag_id=tag.id)
                    db.add(pt)
            
            # 添加商品参数
            for i, param in enumerate(prod_params):
                pp = ProductParam(
                    product_id=product.id,
                    name=param["name"],
                    value=param["value"],
                    sort_order=i
                )
                db.add(pp)
        
        db.commit()
        print("测试数据初始化完成！")
        print("- 管理员账号: admin / admin123")
        print("- 测试账号: testuser / test123")
        
    except Exception as e:
        db.rollback()
        print(f"初始化失败: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    init_test_data()
