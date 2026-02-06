import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check } from 'lucide-react';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, type NotificationItem } from '../services/notificationService';
import { useAuth } from '../contexts';

const NotificationDropdown: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch unread count periodically
    useEffect(() => {
        if (!user) return;

        const fetchUnread = async () => {
            try {
                const count = await getUnreadCount();
                setUnreadCount(count);
            } catch (err) {
                console.error('Failed to fetch unread count:', err);
            }
        };

        fetchUnread();
        const interval = setInterval(fetchUnread, 60000); // Every minute

        return () => clearInterval(interval);
    }, [user]);

    // Fetch notifications when dropdown opens
    useEffect(() => {
        if (isOpen && user) {
            setLoading(true);
            getNotifications(1, 8)
                .then(data => setNotifications(data.list))
                .catch(err => console.error('Failed to fetch notifications:', err))
                .finally(() => setLoading(false));
        }
    }, [isOpen, user]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = async (notification: NotificationItem) => {
        if (!notification.is_read) {
            await markAsRead(notification.id);
            setUnreadCount(prev => Math.max(0, prev - 1));
            setNotifications(prev =>
                prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
            );
        }

        setIsOpen(false);

        if (notification.type === 'new_product' && notification.related_id) {
            // Use setTimeout to ensure the dropdown closes before navigation
            setTimeout(() => {
                navigate(`/product/${notification.related_id}`);
            }, 100);
        }
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead();
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    };

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 hover:bg-black/5 rounded-full transition-all duration-300"
                aria-label="通知"
            >
                <Bell className="w-5 h-5" strokeWidth={1.5} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-3 shadow-lg z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-3">
                        <span className="font-body text-sm font-medium">通知</span>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs text-gray-1 hover:text-black flex items-center gap-1"
                            >
                                <Check className="w-3 h-3" />
                                全部已读
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div className="max-h-80 overflow-y-auto">
                        {loading ? (
                            <div className="py-8 text-center text-gray-1 text-sm">加载中...</div>
                        ) : notifications.length === 0 ? (
                            <div className="py-8 text-center text-gray-1 text-sm">暂无通知</div>
                        ) : (
                            notifications.map(notification => (
                                <button
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`w-full text-left px-4 py-3 hover:bg-gray-2 transition-colors border-b border-gray-3 last:border-b-0 ${!notification.is_read ? 'bg-blue-50/50' : ''
                                        }`}
                                >
                                    <div className="flex gap-3">
                                        {notification.related_image && (
                                            <img
                                                src={notification.related_image}
                                                alt=""
                                                className="w-10 h-10 object-cover flex-shrink-0"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-body text-sm text-black truncate">{notification.title}</p>
                                            <p className="font-body text-xs text-gray-1 truncate mt-0.5">{notification.content}</p>
                                            <p className="font-body text-xs text-gray-5 mt-1">
                                                {new Date(notification.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {!notification.is_read && (
                                            <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1" />
                                        )}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
