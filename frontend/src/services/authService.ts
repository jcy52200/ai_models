import api, { setToken, setStoredUser, removeToken } from './api';
import type { ApiResponse } from './api';

// 用户信息类型
export interface User {
    id: number;
    username: string;
    email: string;
    avatar_url?: string;
    phone?: string;
    is_admin?: boolean;
    created_at: string;
}

// 用户注册请求
export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    phone?: string;
    secret_key?: string;
}

// 用户登录请求
export interface LoginRequest {
    account: string;
    password: string;
}

// 登录/注册响应
export interface AuthResponse {
    user: User;
    token: string;
}

// 用户信息更新
export interface UserUpdateRequest {
    username?: string;
    avatar_url?: string;
    phone?: string;
}

// 密码更新
export interface PasswordUpdateRequest {
    old_password: string;
    new_password: string;
}

/**
 * 用户注册
 */
export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);

    if (response.data.code === 200) {
        const { user, token } = response.data.data;
        setToken(token);
        setStoredUser(user);
        return response.data.data;
    }

    throw new Error(response.data.message);
};

/**
 * 用户登录
 */
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);

    if (response.data.code === 200) {
        const { user, token } = response.data.data;
        setToken(token);
        setStoredUser(user);
        return response.data.data;
    }

    throw new Error(response.data.message);
};

/**
 * 退出登录
 */
export const logout = (): void => {
    removeToken();
};

/**
 * 刷新 Token
 */
export const refreshToken = async (): Promise<string> => {
    const response = await api.post<ApiResponse<{ token: string }>>('/auth/refresh');

    if (response.data.code === 200) {
        const { token } = response.data.data;
        setToken(token);
        return token;
    }

    throw new Error(response.data.message);
};

/**
 * 获取当前用户信息
 */
export const getCurrentUser = async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/users/me');

    if (response.data.code === 200) {
        setStoredUser(response.data.data);
        return response.data.data;
    }

    throw new Error(response.data.message);
};

/**
 * 更新用户信息
 */
export const updateUser = async (data: UserUpdateRequest): Promise<User> => {
    const response = await api.put<ApiResponse<User>>('/users/me', data);

    if (response.data.code === 200) {
        setStoredUser(response.data.data);
        return response.data.data;
    }

    throw new Error(response.data.message);
};

/**
 * 修改密码
 */
export const updatePassword = async (data: PasswordUpdateRequest): Promise<void> => {
    const response = await api.put<ApiResponse<null>>('/users/me/password', data);

    if (response.data.code !== 200) {
        throw new Error(response.data.message);
    }
};
