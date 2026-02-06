import api from './api';
import type { ApiResponse } from './api';

/**
 * Upload an image file to the server.
 * Returns the URL of the uploaded image.
 */
export const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<ApiResponse<{ url: string }>>('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    if (response.data.code === 200) {
        return response.data.data.url;
    }
    throw new Error(response.data.message);
};
