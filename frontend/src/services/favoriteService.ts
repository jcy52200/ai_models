import api from './api';

export interface Favorite {
    id: number;
    user_id: number;
    product_id: number;
    created_at: string;
    product: {
        id: number;
        name: string;
        price: number;
        main_image_url: string;
    };
}

export const toggleFavorite = async (productId: number) => {
    const { data } = await api.post(`/favorites/${productId}`);
    return data;
};

export const getFavorites = async () => {
    const { data } = await api.get<Favorite[]>('/favorites');
    return data;
};

export const checkFavoriteStatus = async (productId: number) => {
    const { data } = await api.get<{ is_favorite: boolean }>(`/favorites/${productId}/check`);
    return data;
};
