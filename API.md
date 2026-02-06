# 电商项目 API 接口文档

## 基础信息

- **Base URL**: `https://api.suju.com/v1` (本地开发: `http://localhost:8000/v1`)
- **Content-Type**: `application/json`
- **认证方式**: Bearer Token (JWT)

## 目录

1.  [认证模块 (Auth)](#1-认证模块-auth)
2.  [用户模块 (User)](#2-用户模块-user)
3.  [商品模块 (Product)](#3-商品模块-product)
4.  [购物车模块 (Cart)](#4-购物车模块-cart)
5.  [订单模块 (Order)](#5-订单模块-order)
6.  [评价模块 (Review)](#6-评价模块-review)
7.  [收藏模块 (Favorite)](#7-收藏模块-favorite)
8.  [通知模块 (Notification)](#8-通知模块-notification)
9.  [管理后台 (Admin)](#9-管理后台-admin)
10. [通用模块 (Common)](#10-通用模块-common)
11. [AI对话模块 (AI)](#11-ai对话模块-ai)

---

### 1. 认证模块 (Auth)

| 方法 | 路径 | 描述 | 权限 |
| :--- | :--- | :--- | :--- |
| POST | `/auth/register` | 用户注册 | 公开 |
| POST | `/auth/login` | 用户登录 | 公开 |
| POST | `/auth/refresh` | 刷新 Token | 需登录 |
| POST | `/auth/password-reset-request` | 密码重置请求（验证邮箱） | 公开 |
| POST | `/auth/password-reset` | 密码重置确认 | 公开 |

#### 注册接口
```http
POST /auth/register
```
**参数**: `username`, `email`, `password`, `phone` (可选), `secret_key` (可选, 用于注册管理员)

#### 登录接口
```http
POST /auth/login
```
**参数**: `account` (用户名/邮箱), `password`

#### 密码重置
```http
POST /auth/password-reset-request
```
**参数**: `email`
**说明**: 验证邮箱是否存在，成功后可进入下一步

```http
POST /auth/password-reset
```
**参数**: `email`, `new_password`
**说明**: 重置用户密码

---

### 2. 用户模块 (User)

| 方法 | 路径 | 描述 | 权限 |
| :--- | :--- | :--- | :--- |
| GET | `/users/me` | 获取当前用户信息 | 需登录 |
| PUT | `/users/me` | 更新当前用户信息 | 需登录 |
| PUT | `/users/me/password` | 修改密码 | 需登录 |
| GET | `/users/addresses` | 获取地址列表 | 需登录 |
| POST | `/users/addresses` | 新增地址 | 需登录 |
| PUT | `/users/addresses/{id}` | 更新地址 | 需登录 |
| DELETE | `/users/addresses/{id}` | 删除地址 | 需登录 |
| PUT | `/users/addresses/{id}/default` | 设为默认地址 | 需登录 |

---

### 3. 商品模块 (Product)

| 方法 | 路径 | 描述 | 权限 |
| :--- | :--- | :--- | :--- |
| GET | `/categories` | 获取分类列表 | 公开 |
| GET | `/categories/{id}` | 获取分类详情 | 公开 |
| GET | `/products` | 获取商品列表 (支持筛选/搜索) | 公开 |
| GET | `/products/{id}` | 获取商品详情 | 公开 |
| GET | `/products/{id}/related` | 获取相关商品 | 公开 |

#### 商品列表查询参数
- `page`, `page_size`: 分页
- `category_id`: 分类筛选
- `tag_id`: 标签筛选
- `min_price`, `max_price`: 价格区间
- `sort_by`: 排序 (`price_asc`, `price_desc`, `sales`, `newest`, `popular`)
- `keyword`: 搜索关键词
- `is_top`: 是否推荐 (`true`/`false`)
- `is_published`: 上架状态 (`true`/`false`)

#### 商品响应字段
- `original_price`: 原价（用于显示划线价）
- `price`: 现售价
- `params`: 商品规格参数数组 `[{name, value}]`

---

### 4. 购物车模块 (Cart)

| 方法 | 路径 | 描述 | 权限 |
| :--- | :--- | :--- | :--- |
| GET | `/cart` | 获取购物车列表 | 需登录 |
| POST | `/cart` | 添加商品到购物车 | 需登录 |
| PUT | `/cart/{id}` | 更新购物车项数量 | 需登录 |
| DELETE | `/cart/{id}` | 删除购物车项 | 需登录 |
| DELETE | `/cart` | 清空购物车 | 需登录 |

---

### 5. 订单模块 (Order)

| 方法 | 路径 | 描述 | 权限 |
| :--- | :--- | :--- | :--- |
| POST | `/orders` | 创建订单 (结算) | 需登录 |
| GET | `/orders` | 获取我的订单列表 | 需登录 |
| GET | `/orders/{id}` | 获取订单详情 (限本人) | 需登录 |
| PUT | `/orders/{id}/cancel` | 取消订单 | 需登录 |
| PUT | `/orders/{id}/confirm` | 确认收货 | 需登录 |
| POST | `/orders/{id}/refund` | 申请退款 | 需登录 |
| PUT | `/orders/{id}/pay` | 模拟支付 (测试用) | 需登录 |

#### 创建订单参数
```json
{
  "cart_item_ids": [1, 2],
  "address_id": 1,
  "payment_method": "alipay",
  "note": "备注"
}
```

---

### 6. 评价模块 (Review)

| 方法 | 路径 | 描述 | 权限 |
| :--- | :--- | :--- | :--- |
| GET | `/products/{id}/reviews` | 获取商品评价列表 | 公开 |
| POST | `/products/{id}/reviews` | 发表评价 | 需登录(需购买) |
| GET | `/reviews/me` | 获取我的评价列表 | 需登录 |
| POST | `/reviews/{id}/like` | 点赞评价 | 需登录 |
| DELETE | `/reviews/{id}/like` | 取消点赞 | 需登录 |

---

### 7. 收藏模块 (Favorite)

| 方法 | 路径 | 描述 | 权限 |
| :--- | :--- | :--- | :--- |
| GET | `/favorites` | 获取收藏列表 | 需登录 |
| POST | `/favorites/{product_id}` | 切换收藏状态 (收藏/取消) | 需登录 |
| GET | `/favorites/{product_id}/check` | 检查是否已收藏 | 需登录 |

---

### 8. 通知模块 (Notification)

| 方法 | 路径 | 描述 | 权限 |
| :--- | :--- | :--- | :--- |
| GET | `/notifications` | 获取通知列表 | 需登录 |
| GET | `/notifications/unread-count` | 获取未读通知数量 | 需登录 |
| PUT | `/notifications/{id}/read` | 标记通知为已读 | 需登录 |
| PUT | `/notifications/read-all` | 标记所有通知为已读 | 需登录 |

#### 通知类型
- `new_product`: 新商品上架通知（创建商品时自动生成）

---

### 9. 管理后台 (Admin)

#### 仪表盘
| 方法 | 路径 | 描述 | 权限 |
| :--- | :--- | :--- | :--- |
| GET | `/admin/dashboard` | 获取统计数据 | 管理员 |

#### 用户管理
| 方法 | 路径 | 描述 | 权限 |
| :--- | :--- | :--- | :--- |
| GET | `/users` | 获取用户列表 | 管理员 |
| PUT | `/users/{id}` | 更新用户信息 | 管理员 |
| DELETE | `/users/{id}` | 删除用户 | 管理员 |

#### 商品管理
| 方法 | 路径 | 描述 | 权限 |
| :--- | :--- | :--- | :--- |
| POST | `/products` | 创建商品 | 管理员 |
| PUT | `/products/{id}` | 更新商品详情 | 管理员 |
| DELETE | `/products/{id}` | 删除商品 | 管理员 |

**商品创建/更新参数**:
- `original_price`: 原价（可选，用于显示划线价）
- `params`: 规格参数数组 `[{name, value}]`

#### 分类管理
| 方法 | 路径 | 描述 | 权限 |
| :--- | :--- | :--- | :--- |
| POST | `/categories` | 创建分类 | 管理员 |
| PUT | `/categories/{id}` | 更新分类 | 管理员 |
| DELETE | `/categories/{id}` | 删除分类 | 管理员 |

#### 订单管理
| 方法 | 路径 | 描述 | 权限 |
| :--- | :--- | :--- | :--- |
| GET | `/orders/all` | 获取所有订单 | 管理员 |
| GET | `/orders/admin/{id}` | 获取订单详情(含备注) | 管理员 |
| PUT | `/orders/{id}/status` | 更新订单状态 | 管理员 |

#### 评价管理
| 方法 | 路径 | 描述 | 权限 |
| :--- | :--- | :--- | :--- |
| GET | `/admin/reviews` | 获取评价列表 | 管理员 |
| PUT | `/admin/reviews/{id}/approve` | 通过评价 | 管理员 |
| PUT | `/admin/reviews/{id}/reject` | 拒绝评价 | 管理员 |
| DELETE | `/admin/reviews/{id}` | 删除评价 | 管理员 |

**评价列表查询参数**:
- `status`: 状态筛选 (`approved`, `rejected`)
- `rating`: 评分筛选 (1-5)

#### 退款管理 (API已实现，前端暂未开放)
| 方法 | 路径 | 描述 | 权限 |
| :--- | :--- | :--- | :--- |
| GET | `/admin/refunds` | 获取退款列表 | 管理员 |
| PUT | `/admin/refunds/{id}/approve` | 批准退款 | 管理员 |
| PUT | `/admin/refunds/{id}/reject` | 拒绝退款 | 管理员 |

---

### 10. 通用模块 (Common)

| 方法 | 路径 | 描述 | 权限 |
| :--- | :--- | :--- | :--- |
| POST | `/upload` | 图片上传 | 需登录 |

**响应**: Returns `{"url": "/uploads/filename.ext"}`

---

### 11. AI对话模块 (AI)

| 方法 | 路径 | 描述 | 权限 |
| :--- | :--- | :--- | :--- |
| GET | `/ai/sessions` | 获取会话列表 | 需登录 |
| POST | `/ai/sessions` | 创建新会话 | 需登录 |
| DELETE | `/ai/sessions/{id}` | 删除会话 | 需登录 |
| GET | `/ai/sessions/{token}/messages` | 获取会话消息记录 | 需登录 |
| POST | `/ai/chat` | 发送对话消息 | 需登录 |

#### 发送消息参数
```json
{
  "session_token": "string",
  "content": "帮我推荐一款沙发"
}
```

**说明**: AI服务集成了DeepSeek模型，利用RAG技术关联商品和订单上下文。支持Markdown格式返回。
