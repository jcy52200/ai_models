# 素居家具电商系统

一个功能完整的家具电商独立站系统，包含用户端和管理后台，采用前后端分离架构。

## 🚀 快速开始

### 环境要求
- Python 3.8+
- Node.js 16+
- npm 或 yarn

### 后端启动
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```
API 文档: http://localhost:8000/docs

### 前端启动
```bash
cd frontend
npm install
npm run dev
```
访问: http://localhost:5173

---

## 📦 技术栈

### 后端
- **框架**: FastAPI (Python)
- **数据库**: SQLite + SQLAlchemy ORM
- **认证**: JWT (JSON Web Tokens)
- **AI**: 硅基流动 DeepSeek-R1 模型

### 前端
- **框架**: React 18 + TypeScript + Vite
- **状态管理**: Context API
- **样式**: Tailwind CSS
- **路由**: React Router v6
- **HTTP**: Axios

---

## ✨ 功能特性

### 用户端
| 模块 | 功能 |
| :--- | :--- |
| 🔐 认证 | 注册、登录、密码重置 |
| 🛍️ 商品 | 浏览、搜索、筛选、详情、收藏 |
| 🛒 购物车 | 添加、修改数量、删除、结算 |
| 📦 订单 | 创建、支付、确认收货、申请退款 |
| ⭐ 评价 | 发表评价、点赞、查看历史 |
| 🔔 通知 | 新商品上架提醒、未读提示 |
| 🤖 AI 助手 | 智能问答、商品推荐 |
| 👤 个人中心 | 信息管理、地址管理 |

### 管理后台
| 模块 | 功能 |
| :--- | :--- |
| 📊 仪表盘 | 数据统计、可视化图表 |
| 👥 用户 | 列表查看、编辑、删除 |
| 📁 分类 | 增删改查 |
| 📦 商品 | 发布、编辑（支持原价/规格参数）、上下架 |
| 📋 订单 | 列表、详情、状态更新、发货 |
| ⭐ 评价 | 审核（通过/拒绝）、删除 |

---

## 📁 项目结构

```
SU_JU/
├── backend/                # FastAPI 后端
│   ├── app/
│   │   ├── models/         # 数据库模型
│   │   ├── routers/        # API 路由
│   │   ├── schemas/        # Pydantic 模式
│   │   ├── utils/          # 工具函数
│   │   └── main.py         # 应用入口
│   └── requirements.txt
│
├── frontend/               # React 前端
│   ├── src/
│   │   ├── components/     # 通用组件
│   │   ├── config/         # 配置文件（主题、文案）
│   │   ├── contexts/       # Context 状态
│   │   ├── hooks/          # 自定义 Hooks
│   │   ├── layouts/        # 布局组件
│   │   ├── pages/          # 页面组件
│   │   ├── sections/       # 页面区块
│   │   └── services/       # API 服务
│   └── package.json
│
├── API.md                  # API 接口文档
├── ROUTES.md               # 路由文档
├── DERIVATIVE_PROJECTS.md  # 衍生项目规划
└── README.md               # 本文件
```

---


## 🗄️ 数据库模型

| 表名 | 说明 |
| :--- | :--- |
| `users` | 用户信息 |
| `user_addresses` | 收货地址 |
| `categories` | 商品分类 |
| `products` | 商品信息（含原价、规格参数） |
| `product_params` | 商品规格参数 |
| `cart_items` | 购物车 |
| `orders` | 订单 |
| `order_items` | 订单明细 |
| `product_reviews` | 商品评价 |
| `review_likes` | 评价点赞 |
| `notifications` | 通知消息 |
| `ai_chat_sessions` | AI 对话会话 |
| `ai_chat_messages` | AI 对话消息 |
| `refunds` | 退款申请 |

---

## 🔑 管理员账号

注册时使用 `secret_key` 参数注册为管理员：
```json
{
  "username": "admin",
  "email": "admin@suju.com",
  "password": "admin123",
  "secret_key": "your_admin_secret"
}
```

---


## ⚠️ 注意事项

1. **仅限本地开发**: 本项目仅供学习和开发环境使用
2. **模拟支付**: 支付功能为模拟实现，直接返回成功
3. **文件存储**: 上传文件存储在 `/uploads/` 目录
4. **AI 服务**: 需配置硅基流动 API Key
