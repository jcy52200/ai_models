import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

// API 基础配置
const BASE_URL = 'http://localhost:8000/v1';

// 创建 Axios 实例
const api: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 60000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Token 存储键名
const TOKEN_KEY = 'suju_token';
const USER_KEY = 'suju_user';

// 获取存储的 Token
export const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};

// 设置 Token
export const setToken = (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
};

// 移除 Token
export const removeToken = (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

// 获取存储的用户信息
export const getStoredUser = (): any | null => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
};

// 设置用户信息
export const setStoredUser = (user: any): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// 请求拦截器
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// 响应拦截器
api.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError) => {
        if (error.response) {
            const status = error.response.status;

            // Token 过期或无效
            if (status === 401) {
                removeToken();
                // 可以在这里触发重定向到登录页
                window.location.href = '/login';
            }

            // 权限不足
            if (status === 403) {
                console.error('权限不足');
            }
        }

        return Promise.reject(error);
    }
);

// API 响应类型
export interface ApiResponse<T = any> {
    code: number;
    message: string;
    data: T;
    errors?: Record<string, string[]>;
}

// 分页信息
export interface Pagination {
    page: number;
    page_size: number;
    total: number;
    total_pages?: number;
}

// 分页响应
export interface PaginatedResponse<T> {
    list: T[];
    pagination: Pagination;
}

export default api;
