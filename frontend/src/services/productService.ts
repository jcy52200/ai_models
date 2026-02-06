import api from './api';
import type { ApiResponse, PaginatedResponse } from './api';

// 标签类型
export interface Tag {
    id: number;
    name: string;
    color: string;
}

// 分类类型
export interface Category {
    id: number;
    name: string;
    description?: string;
    parent_id: number;
    sort_order: number;
    is_active: boolean;
    children?: Category[];
}

// 商品参数类型
export interface ProductParam {
    name: string;
    value: string;
}

// 商品列表项
export interface ProductListItem {
    id: number;
    name: string;
    short_description?: string;
    price: number;
    original_price?: number;
    main_image_url?: string;
    stock: number;
    sales_count: number;
    is_published: boolean;
    tags: Tag[];
    category?: Category;
}

// 评价统计
export interface ReviewsSummary {
    total: number;
    average_rating: number;
    rating_5: number;
    rating_4: number;
    rating_3: number;
    rating_2: number;
    rating_1: number;
}

// 商品详情
export interface ProductDetail extends ProductListItem {
    description?: string;
    image_urls?: string[];
    params: ProductParam[];
    view_count: number;
    created_at: string;
    reviews_summary?: ReviewsSummary;
}

// 商品查询参数
export interface ProductQuery {
    page?: number;
    page_size?: number;
    category_id?: number;
    tag_id?: number;
    min_price?: number;
    max_price?: number;
    sort_by?: 'price_asc' | 'price_desc' | 'sales' | 'newest' | 'popular';
    keyword?: string;
    is_top?: boolean;
    is_published?: boolean;
}

/**
 * 获取分类列表
 */
export const getCategories = async (params?: {
    parent_id?: number;
    is_active?: boolean;
}): Promise<Category[]> => {
    const response = await api.get<ApiResponse<Category[]>>('/categories', { params });

    if (response.data.code === 200) {
        return response.data.data;
    }

    throw new Error(response.data.message);
};

/**
 * 获取分类详情
 */
export const getCategory = async (id: number): Promise<Category> => {
    const response = await api.get<ApiResponse<Category>>(`/categories/${id}`);

    if (response.data.code === 200) {
        return response.data.data;
    }

    throw new Error(response.data.message);
};

/**
 * 获取商品列表
 */
export const getProducts = async (
    query: ProductQuery = {}
): Promise<PaginatedResponse<ProductListItem>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<ProductListItem>>>('/products', {
        params: query,
    });

    if (response.data.code === 200) {
        return response.data.data;
    }

    throw new Error(response.data.message);
};

/**
 * 获取商品详情
 */
export const getProduct = async (id: number): Promise<ProductDetail> => {
    const response = await api.get<ApiResponse<ProductDetail>>(`/products/${id}`);

    if (response.data.code === 200) {
        return response.data.data;
    }

    throw new Error(response.data.message);
};

/**
 * 获取相关商品
 */
export const getRelatedProducts = async (
    productId: number,
    limit: number = 4
): Promise<ProductListItem[]> => {
    const response = await api.get<ApiResponse<ProductListItem[]>>(
        `/products/${productId}/related`,
        { params: { limit } }
    );

    if (response.data.code === 200) {
        return response.data.data;
    }

    throw new Error(response.data.message);
};
