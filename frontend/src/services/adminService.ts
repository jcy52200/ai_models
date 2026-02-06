import api from './api';
import type { ApiResponse, PaginatedResponse } from './api';
import type { User } from './authService';
import type { ProductDetail } from './productService';
import type { OrderListItem } from './orderService';

// ==================== 仪表盘 ====================

export interface DashboardStats {
    total_users: number;
    total_products: number;
    total_orders: number;
    total_sales: number;
    pending_orders: number;
    pending_reviews: number;
    sales_data: { name: string; sales: number }[];
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
    const response = await api.get<ApiResponse<DashboardStats>>('/admin/dashboard');
    if (response.data.code === 200) {
        return response.data.data;
    }
    throw new Error(response.data.message);
};

// ==================== 用户管理 ====================

export const getUsers = async (page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<User>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<User>>>('/users', {
        params: { page, page_size: pageSize }
    });
    if (response.data.code === 200) {
        return response.data.data;
    }
    throw new Error(response.data.message);
};

export const updateUser = async (id: number, data: any): Promise<void> => {
    const response = await api.put<ApiResponse<null>>(`/users/${id}`, data);
    if (response.data.code !== 200) {
        throw new Error(response.data.message);
    }
};

export const deleteUser = async (id: number): Promise<void> => {
    const response = await api.delete<ApiResponse<null>>(`/users/${id}`);
    if (response.data.code !== 200) {
        throw new Error(response.data.message);
    }
};

// ==================== 商品管理 ====================

// 商品创建/更新类型定义
export interface ProductParamInput {
    name: string;
    value: string;
}

export interface ProductInput {
    name: string;
    category_id: number;
    short_description?: string;
    description?: string;
    price: number;
    original_price?: number;
    stock: number;
    main_image_url?: string;
    image_urls?: string[];
    params?: ProductParamInput[];
    is_published?: boolean;
    is_top?: boolean;
    is_new?: boolean;
}

export const createProduct = async (data: ProductInput): Promise<ProductDetail> => {
    const response = await api.post<ApiResponse<ProductDetail>>('/products', data);
    if (response.data.code === 200) {
        return response.data.data;
    }
    throw new Error(response.data.message);
};

export const updateProduct = async (id: number, data: Partial<ProductInput>): Promise<ProductDetail> => {
    const response = await api.put<ApiResponse<ProductDetail>>(`/products/${id}`, data);
    if (response.data.code === 200) {
        return response.data.data;
    }
    throw new Error(response.data.message);
};

export const deleteProduct = async (id: number): Promise<void> => {
    const response = await api.delete<ApiResponse<null>>(`/products/${id}`);
    if (response.data.code !== 200) {
        throw new Error(response.data.message);
    }
};

// ==================== 订单管理 ====================

export interface OrderQuery {
    page?: number;
    page_size?: number;
    status?: string;
    order_number?: string;
}

export const getAllOrders = async (query: OrderQuery = {}): Promise<PaginatedResponse<OrderListItem>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<OrderListItem>>>('/orders/all', {
        params: query
    });
    if (response.data.code === 200) {
        return response.data.data;
    }
    throw new Error(response.data.message);
};

export const getAdminOrderDetail = async (id: number): Promise<any> => {
    const response = await api.get<ApiResponse<any>>(`/orders/admin/${id}`);
    if (response.data.code === 200) {
        return response.data.data;
    }
    throw new Error(response.data.message);
};

export const updateOrderStatus = async (id: number, status: string, trackingNumber?: string): Promise<void> => {
    const response = await api.put<ApiResponse<null>>(`/orders/${id}/status`, {
        status,
        tracking_number: trackingNumber
    });
    if (response.data.code !== 200) {
        throw new Error(response.data.message);
    }
};

// ==================== 分类管理 ====================

export interface Category {
    id: number;
    name: string;
    description?: string;
    parent_id: number;
    sort_order: number;
    is_active: boolean;
    children?: Category[];
}

export const getAdminCategories = async (parentId: number = 0): Promise<Category[]> => {
    const response = await api.get<ApiResponse<Category[]>>('/categories', { params: { parent_id: parentId } });
    if (response.data.code === 200) {
        return response.data.data;
    }
    throw new Error(response.data.message);
};

export const createCategory = async (data: any): Promise<Category> => {
    const response = await api.post<ApiResponse<Category>>('/categories', data);
    if (response.data.code === 200) {
        return response.data.data;
    }
    throw new Error(response.data.message);
};

export const updateCategory = async (id: number, data: any): Promise<Category> => {
    const response = await api.put<ApiResponse<Category>>(`/categories/${id}`, data);
    if (response.data.code === 200) {
        return response.data.data;
    }
    throw new Error(response.data.message);
};

export const deleteCategory = async (id: number): Promise<void> => {
    const response = await api.delete<ApiResponse<null>>(`/categories/${id}`);
    if (response.data.code !== 200) {
        throw new Error(response.data.message);
    }
};

// ==================== 文件上传 ====================

// ==================== 文件上传 ====================

export { uploadImage } from './uploadService';

