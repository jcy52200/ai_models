import api from './api';

export interface NotificationItem {
    id: number;
    type: string;
    title: string;
    content: string;
    related_id: number | null;
    related_image: string | null;
    is_read: boolean;
    created_at: string;
}

export interface NotificationListResponse {
    list: NotificationItem[];
    pagination: {
        page: number;
        page_size: number;
        total: number;
    };
}

export const getNotifications = async (page: number = 1, pageSize: number = 10): Promise<NotificationListResponse> => {
    const res = await api.get('/notifications', { params: { page, page_size: pageSize } });
    return res.data.data;
};

export const getUnreadCount = async (): Promise<number> => {
    const res = await api.get('/notifications/unread-count');
    return res.data.data.count;
};

export const markAsRead = async (notificationId: number): Promise<void> => {
    await api.put(`/notifications/${notificationId}/read`);
};

export const markAllAsRead = async (): Promise<void> => {
    await api.put('/notifications/read-all');
};
