import os
import requests
import json
from sqlalchemy.orm import Session
from sqlalchemy import or_
from ..models import Product, Order, OrderItem
from ..config import settings

# SiliconFlow API Configuration
SILICONFLOW_API_URL = "https://api.siliconflow.cn/v1/chat/completions"
MODEL_NAME = "deepseek-ai/DeepSeek-R1-0528-Qwen3-8B"

class AIService:
    def __init__(self, db: Session):
        self.db = db
        self.api_key = settings.SILICONFLOW_API_KEY

    def _get_product_context(self, query: str):
        # Simple keyword extraction (naive)
        keywords = query.split()
        relevant_products = []
        
        # Search capabilities
        if not keywords:
            return ""

        # Construct a search query
        # We look for products where name or description contains any of the keywords
        # Limit to top 5 to avoid context overflow
        db_query = self.db.query(Product).filter(
            or_(*[Product.name.ilike(f"%{kw}%") for kw in keywords])
        ).limit(5)
        
        products = db_query.all()
        
        if not products:
            return ""

        context_lines = ["找到相关商品:"]
        for p in products:
            context_lines.append(
                f"- ID: {p.id}, 名称: {p.name}, 价格: ¥{p.price}, 库存: {p.stock}, "
                f"描述: {p.short_description or p.description[:50]}..."
            )
        return "\n".join(context_lines)

    def _get_order_context(self, user_id: int, query: str):
        if not user_id:
            return ""
        
        # Check if query implies order lookup
        order_keywords = ["order", "shipping", "bought", "purchase", "delivery", "status"]
        if not any(kw in query.lower() for kw in order_keywords):
            return ""

        # Get recent 3 orders
        orders = self.db.query(Order).filter(Order.user_id == user_id)\
            .order_by(Order.created_at.desc()).limit(3).all()
        
        if not orders:
            return "用户近期无订单。"

        context_lines = ["用户近期订单:"]
        for o in orders:
            items = ", ".join([f"{i.product_name} x{i.quantity}" for i in o.items])
            context_lines.append(
                f"- 订单号 #{o.order_number}: 状态={o.status}, 总价=¥{o.total_amount}, "
                f"包含商品=[{items}], 时间={o.created_at}"
            )
        return "\n".join(context_lines)

    def generate_response(self, user_id: int, messages: list):
        if not self.api_key:
            return "错误: 系统AI API Key未配置，请联系管理员。"

        # Get the latest user message
        last_message = messages[-1]['content'] if messages else ""
        
        # Build Context
        product_context = self._get_product_context(last_message)
        order_context = self._get_order_context(user_id, last_message)
        
        system_context = (
            "你是素居家具店的智能助手，一位乐于助人的AI。 "
            "回答语言必须是中文。 "
            "语气专业、温暖、简洁。 "
            "绝对不要提到你是 DeepSeek 或 SiliconFlow 的模型。 "
            "不要说'根据数据库'、'基于产品库'等话术，要像一个专业的店员一样自然地介绍商品。 "
            "如果推荐商品，请清晰地提供商品ID和名称。 "
            "使用Markdown格式回复，例如使用列表、粗体等让阅读更舒适。 "
            "\n\n相关上下文信息:\n"
            f"{product_context}\n"
            f"{order_context}\n"
        )

        # Prepare payload
        payload_messages = [{"role": "system", "content": system_context}]
        # Add history (limit to last 10 to save tokens)
        payload_messages.extend(messages[-10:]) 

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": MODEL_NAME,
            "messages": payload_messages,
            "stream": False,
            "temperature": 0.7
        }

        try:
            response = requests.post(SILICONFLOW_API_URL, headers=headers, json=data, timeout=60)
            response.raise_for_status()
            result = response.json()
            ai_content = result['choices'][0]['message']['content']
            return ai_content
        except Exception as e:
            print(f"AI API Error: {e}")
            return "抱歉，目前由于网络问题无法连接此服务，请稍后再试。"
