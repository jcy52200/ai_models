import api from './api';
import type { ApiResponse } from './api';

// 购物车商品信息
export interface CartProduct {
    id: number;
    name: string;
    price: number;
    main_image_url?: string;
    stock: number;
}

// 购物车项
export interface CartItem {
    id: number;
    product: CartProduct;
    quantity: number;
    subtotal: number;
    added_at: string;
}

// 购物车响应
export interface CartResponse {
    items: CartItem[];
    total_count: number;
    total_amount: number;
}

/**
 * 获取购物车
 */
export const getCart = async (): Promise<CartResponse> => {
    const response = await api.get<ApiResponse<CartResponse>>('/cart');

    if (response.data.code === 200) {
        return response.data.data;
    }

    throw new Error(response.data.message);
};

/**
 * 添加商品到购物车
 */
export const addToCart = async (
    productId: number,
    quantity: number = 1
): Promise<CartResponse> => {
    const response = await api.post<ApiResponse<CartResponse>>('/cart', {
        product_id: productId,
        quantity,
    });

    if (response.data.code === 200) {
        return response.data.data;
    }

    throw new Error(response.data.message);
};

/**
 * 更新购物车商品数量
 */
export const updateCartItem = async (
    cartItemId: number,
    quantity: number
): Promise<CartResponse> => {
    const response = await api.put<ApiResponse<CartResponse>>(`/cart/${cartItemId}`, {
        quantity,
    });

    if (response.data.code === 200) {
        return response.data.data;
    }

    throw new Error(response.data.message);
};

/**
 * 删除购物车商品
 */
export const removeFromCart = async (cartItemId: number): Promise<void> => {
    const response = await api.delete<ApiResponse<null>>(`/cart/${cartItemId}`);

    if (response.data.code !== 200) {
        throw new Error(response.data.message);
    }
};

/**
 * 清空购物车
 */
export const clearCart = async (): Promise<void> => {
    const response = await api.delete<ApiResponse<null>>('/cart');

    if (response.data.code !== 200) {
        throw new Error(response.data.message);
    }
};
