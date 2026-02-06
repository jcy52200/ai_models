import api from './api';
import type { ApiResponse } from './api';

// 地址类型
export interface Address {
    id: number;
    recipient_name: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    detail_address: string;
    is_default: boolean;
    created_at: string;
}

// 创建/更新地址请求
export interface AddressRequest {
    recipient_name: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    detail_address: string;
    is_default?: boolean;
}

/**
 * 获取用户地址列表
 */
export const getAddresses = async (): Promise<Address[]> => {
    const response = await api.get<ApiResponse<Address[]>>('/users/addresses');

    if (response.data.code === 200) {
        return response.data.data;
    }

    throw new Error(response.data.message);
};

/**
 * 创建地址
 */
export const createAddress = async (data: AddressRequest): Promise<Address> => {
    const response = await api.post<ApiResponse<Address>>('/users/addresses', data);

    if (response.data.code === 200) {
        return response.data.data;
    }

    throw new Error(response.data.message);
};

/**
 * 更新地址
 */
export const updateAddress = async (id: number, data: AddressRequest): Promise<Address> => {
    const response = await api.put<ApiResponse<Address>>(`/users/addresses/${id}`, data);

    if (response.data.code === 200) {
        return response.data.data;
    }

    throw new Error(response.data.message);
};

/**
 * 删除地址
 */
export const deleteAddress = async (id: number): Promise<void> => {
    const response = await api.delete<ApiResponse<null>>(`/users/addresses/${id}`);

    if (response.data.code !== 200) {
        throw new Error(response.data.message);
    }
};

/**
 * 设置默认地址
 */
export const setDefaultAddress = async (id: number): Promise<void> => {
    const response = await api.put<ApiResponse<null>>(`/users/addresses/${id}/default`);

    if (response.data.code !== 200) {
        throw new Error(response.data.message);
    }
};
