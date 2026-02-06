import api from './api';
import type { ApiResponse, PaginatedResponse } from './api';

export interface UserInfo {
    id: number;
    username: string;
    avatar_url?: string;
}

export interface ReviewReply {
    id: number;
    content: string;
    user: UserInfo;
    created_at: string;
}

export interface ProductReview {
    id: number;
    user: UserInfo;
    rating: number;
    content: string;
    image_urls?: string[];
    like_count: number;
    is_liked: boolean;
    replies: ReviewReply[];
    created_at: string;
}

export interface CreateReviewRequest {
    order_id: number;
    rating: number;
    content: string;
    image_urls?: string[];
    is_anonymous?: boolean;
}

export interface ReviewQuery {
    page?: number;
    page_size?: number;
    sort_by?: 'newest' | 'rating_desc' | 'rating_asc';
}

/**
 * 获取商品评价列表
 */
export const getProductReviews = async (
    productId: number,
    query: ReviewQuery = {}
): Promise<PaginatedResponse<ProductReview>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<ProductReview>>>(
        `/products/${productId}/reviews`,
        { params: query }
    );

    if (response.data.code === 200) {
        return response.data.data;
    }

    throw new Error(response.data.message);
};

/**
 * 创建评价
 */
export const createReview = async (
    productId: number,
    data: CreateReviewRequest
): Promise<ProductReview> => {
    const response = await api.post<ApiResponse<ProductReview>>(
        `/products/${productId}/reviews`,
        data
    );

    if (response.data.code === 200) {
        return response.data.data;
    }

    throw new Error(response.data.message);
};

/**
 * 点赞评价
 */
export const likeReview = async (reviewId: number): Promise<void> => {
    const response = await api.post<ApiResponse<null>>(`/reviews/${reviewId}/like`);

    if (response.data.code !== 200) {
        throw new Error(response.data.message);
    }
};

/**
 * 取消点赞
 */
export const unlikeReview = async (reviewId: number): Promise<void> => {
    const response = await api.delete<ApiResponse<null>>(`/reviews/${reviewId}/like`);

    if (response.data.code !== 200) {
        throw new Error(response.data.message);
    }
};

/**
 * 获取用户的评价列表
 */
export const getUserReviews = async (
    query: ReviewQuery = {}
): Promise<PaginatedResponse<ProductReview & { product: { id: number; name: string; main_image_url: string } }>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<ProductReview & { product: { id: number; name: string; main_image_url: string } }>>>(
        '/reviews/me',
        { params: query }
    );

    if (response.data.code === 200) {
        return response.data.data;
    }

    throw new Error(response.data.message);
};
