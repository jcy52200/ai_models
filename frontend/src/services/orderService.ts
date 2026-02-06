import api from './api';
import type { ApiResponse, PaginatedResponse } from './api';

// 收货地址
export interface ShippingAddress {
    recipient_name: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    detail_address: string;
}

// 订单项
export interface OrderItem {
    id: number;
    product_id: number;
    product_name: string;
    product_image?: string;
    unit_price: number;
    quantity: number;
    subtotal: number;
}

// 订单时间线
export interface OrderTimeline {
    status: string;
    status_text: string;
    time: string;
    description?: string;
}

// 订单列表项
export interface OrderListItem {
    id: number;
    order_number: string;
    total_amount: number;
    status: string;
    status_text: string;
    items: OrderItem[];
    created_at: string;
}

// 订单详情
export interface OrderDetail extends OrderListItem {
    payment_method?: string;
    shipping_address?: ShippingAddress;
    shipping_fee: number;
    note?: string;
    timelines: OrderTimeline[];
    paid_at?: string;
    shipped_at?: string;
    completed_at?: string;
}

// 创建订单请求
export interface CreateOrderRequest {
    cart_item_ids: number[];
    address_id: number;
    payment_method: 'alipay' | 'wechat' | 'unionpay';
    note?: string;
    use_balance?: boolean;
    coupon_code?: string;
}

// 创建订单响应
export interface CreateOrderResponse {
    order: OrderListItem;
    payment: {
        payment_url: string;
        expire_at: string;
    };
}

/**
 * 创建订单
 */
export const createOrder = async (
    data: CreateOrderRequest
): Promise<CreateOrderResponse> => {
    const response = await api.post<ApiResponse<CreateOrderResponse>>('/orders', data);

    if (response.data.code === 200) {
        return response.data.data;
    }

    throw new Error(response.data.message);
};

/**
 * 获取订单列表
 */
export const getOrders = async (params: {
    page?: number;
    page_size?: number;
    status?: string;
} = {}): Promise<PaginatedResponse<OrderListItem>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<OrderListItem>>>('/orders', {
        params,
    });

    if (response.data.code === 200) {
        return response.data.data;
    }

    throw new Error(response.data.message);
};

/**
 * 获取订单详情
 */
export const getOrder = async (id: number): Promise<OrderDetail> => {
    const response = await api.get<ApiResponse<OrderDetail>>(`/orders/${id}`);

    if (response.data.code === 200) {
        return response.data.data;
    }

    throw new Error(response.data.message);
};

/**
 * 取消订单
 */
export const cancelOrder = async (id: number, reason: string): Promise<void> => {
    const response = await api.put<ApiResponse<null>>(`/orders/${id}/cancel`, {
        reason,
    });

    if (response.data.code !== 200) {
        throw new Error(response.data.message);
    }
};

/**
 * 确认收货
 */
export const confirmOrder = async (id: number): Promise<void> => {
    const response = await api.put<ApiResponse<null>>(`/orders/${id}/confirm`);

    if (response.data.code !== 200) {
        throw new Error(response.data.message);
    }
};

/**
 * 申请退款
 */
export const applyRefund = async (id: number, reason: string): Promise<void> => {
    const response = await api.put<ApiResponse<null>>(`/orders/${id}/refund`, {
        reason,
    });

    if (response.data.code !== 200) {
        throw new Error(response.data.message);
    }
};

/**
 * 模拟支付（开发测试用）
 */
export const simulatePay = async (id: number): Promise<void> => {
    const response = await api.put<ApiResponse<null>>(`/orders/${id}/pay`);

    if (response.data.code !== 200) {
        throw new Error(response.data.message);
    }
};
