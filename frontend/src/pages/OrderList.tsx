import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Package,
    Truck,
    CheckCircle,
    Clock,
    XCircle,
    RefreshCw,
    ShoppingBag,
    Loader2
} from 'lucide-react';
import { getOrders, confirmOrder, applyRefund } from '../services/orderService';
import type { OrderListItem } from '../services/orderService';
import { useAuth } from '../contexts';

// 订单状态配置
const statusConfig: Record<string, any> = {
    pending: {
        label: '待支付',
        icon: Clock,
        color: 'text-amber-500',
        bgColor: 'bg-amber-50',
    },
    paid: {
        label: '待发货',
        icon: Package,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
    },
    shipped: {
        label: '待收货',
        icon: Truck,
        color: 'text-purple-500',
        bgColor: 'bg-purple-50',
    },
    completed: {
        label: '已完成',
        icon: CheckCircle,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
    },
    cancelled: {
        label: '已取消',
        icon: XCircle,
        color: 'text-gray-5',
        bgColor: 'bg-gray-2',
    },
    refunded: {
        label: '已退款',
        icon: RefreshCw,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
    },
};

// 状态标签
const statusTabs = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待支付' },
    { key: 'paid', label: '待发货' },
    { key: 'shipped', label: '待收货' },
    { key: 'completed', label: '已完成' },
    { key: 'refunded', label: '退款/售后' }, // 注意：后端状态可能没有 refunded，根据实际情况调整
];

export default function OrderList() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { isAuthenticated } = useAuth();

    const [orders, setOrders] = useState<OrderListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);

    // Modals state
    const [refundOrder, setRefundOrder] = useState<OrderListItem | null>(null);
    const [refundReason, setRefundReason] = useState('');

    const [reviewItem, setReviewItem] = useState<{ orderId: number, item: any } | null>(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewContent, setReviewContent] = useState('');
    const [reviewImages, setReviewImages] = useState<string[]>([]);

    const activeStatus = searchParams.get('status') || 'all';

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        setIsVisible(true);
    }, [isAuthenticated]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const status = activeStatus === 'all' ? undefined : activeStatus;
            const data = await getOrders({ status, page_size: 100 });
            setOrders(data.list);
        } catch (error) {
            console.error('获取订单列表失败:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchOrders();
        }
    }, [isAuthenticated, activeStatus]);

    const handleTabChange = (status: string) => {
        setSearchParams({ status });
    };

    const onConfirmReceipt = async (orderId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm('确认收到商品了吗？')) return;
        try {
            await confirmOrder(orderId);
            alert('确认收货成功');
            fetchOrders();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const onRequestRefund = (order: OrderListItem, e: React.MouseEvent) => {
        e.stopPropagation();
        setRefundOrder(order);
        setRefundReason('');
    };

    const submitRefund = async () => {
        if (!refundOrder) return;
        if (!refundReason.trim()) {
            alert('请填写退款原因');
            return;
        }
        try {
            await applyRefund(refundOrder.id, refundReason);
            alert('退款申请已提交');
            setRefundOrder(null);
            fetchOrders();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const onReviewParams = (orderId: number, item: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setReviewItem({ orderId, item });
        setReviewRating(5);
        setReviewContent('');
        setReviewImages([]);
    };

    const submitReview = async () => {
        if (!reviewItem) return;
        if (!reviewContent.trim()) {
            alert('请填写评价内容');
            return;
        }
        try {
            const { createReview } = await import('../services/reviewService');
            await createReview(reviewItem.item.product_id, {
                rating: reviewRating,
                content: reviewContent,
                image_urls: reviewImages,
                order_id: reviewItem.orderId
            });
            alert('评价发布成功');
            setReviewItem(null);
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            try {
                const { uploadImage } = await import('../services/uploadService');
                const url = await uploadImage(files[0]);
                setReviewImages([...reviewImages, url]);
            } catch (error: any) {
                alert(error.message);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-2 pt-20 flex justify-center items-center">
                <Loader2 className="w-8 h-8 animate-spin text-black" />
            </div>
        );
    }

    return (
        <div ref={sectionRef} className="min-h-screen bg-gray-2 pt-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-3 sticky top-0 z-10">
                <div className="w-full px-6 lg:px-12 py-8">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="font-display text-3xl text-black">我的订单</h1>
                    </div>
                </div>

                {/* Tabs */}
                <div className="w-full px-6 lg:px-12 mt-4 overflow-x-auto scrollbar-hide">
                    <div className="max-w-7xl mx-auto flex gap-8">
                        {statusTabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => handleTabChange(tab.key)}
                                className={`pb-4 whitespace-nowrap text-sm font-body transition-all relative ${activeStatus === tab.key
                                    ? 'text-black font-medium'
                                    : 'text-gray-1 hover:text-black'
                                    }`}
                            >
                                {tab.label}
                                {activeStatus === tab.key && (
                                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="w-full px-6 lg:px-12 py-8">
                <div className="max-w-7xl mx-auto">
                    {orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <ShoppingBag className="w-16 h-16 text-gray-3 mb-4" strokeWidth={1} />
                            <h3 className="text-lg font-display text-black mb-2">暂无订单</h3>
                            <p className="text-gray-1 font-body mb-6">您还没有相关的订单记录</p>
                            <button
                                onClick={() => navigate('/')}
                                className="px-6 py-2 bg-black text-white font-body text-sm hover:bg-gray-800 transition-colors"
                            >
                                去购物
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order, index) => {
                                const status = statusConfig[order.status] || statusConfig.pending;
                                const StatusIcon = status.icon;

                                return (
                                    <div
                                        key={order.id}
                                        onClick={() => navigate(`/order/${order.id}`)}
                                        className={`bg-white p-6 transition-all duration-600 hover:shadow-lg cursor-pointer ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                                            }`}
                                        style={{
                                            transitionDelay: `${index * 50}ms`,
                                            transitionTimingFunction: 'var(--ease-expo-out)',
                                        }}
                                    >
                                        {/* Order Header */}
                                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-2">
                                            <div className="flex items-center gap-4">
                                                <span className="font-display text-lg text-black">
                                                    {order.order_number}
                                                </span>
                                                <span className="text-sm text-gray-1 font-body">
                                                    {new Date(order.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-body ${status.bgColor} ${status.color}`}>
                                                <StatusIcon className="w-4 h-4" />
                                                <span>{status.label}</span>
                                            </div>
                                        </div>

                                        {/* Order Items */}
                                        <div className="space-y-4">
                                            {order.items.map((item) => (
                                                <div key={item.id} className="flex gap-4">
                                                    <div className="w-20 h-20 bg-gray-2 overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={item.product_image || '/placeholder.jpg'}
                                                            alt={item.product_name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h3 className="font-body text-black truncate pr-4">
                                                                    {item.product_name}
                                                                </h3>
                                                                <p className="text-gray-1 font-body text-sm mt-1">
                                                                    ×{item.quantity}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-display text-black">
                                                                    ¥{item.unit_price.toLocaleString()}
                                                                </p>
                                                                {order.status === 'completed' && (
                                                                    <button
                                                                        onClick={(e) => onReviewParams(order.id, item, e)}
                                                                        className="mt-2 text-xs border border-gray-300 px-2 py-1 hover:border-black hover:bg-black hover:text-white transition-colors"
                                                                    >
                                                                        评价
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Order Footer */}
                                        <div className="mt-6 pt-4 border-t border-gray-2 flex items-center justify-between">
                                            <div className="text-sm text-gray-1 font-body">
                                                共 {order.items.length} 件商品
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="font-body text-gray-1">实付款</span>
                                                <span className="font-display text-2xl text-black">
                                                    ¥{order.total_amount.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-4 flex justify-end gap-3">
                                            {order.status === 'pending' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/order/${order.id}`);
                                                    }}
                                                    className="px-4 py-2 border border-black text-sm font-body hover:bg-black hover:text-white transition-colors"
                                                >
                                                    去支付
                                                </button>
                                            )}
                                            {order.status === 'paid' && (
                                                <button
                                                    onClick={(e) => onRequestRefund(order, e)}
                                                    className="px-4 py-2 border border-gray-300 text-sm font-body hover:border-red-500 hover:text-red-500 transition-colors"
                                                >
                                                    申请退款
                                                </button>
                                            )}
                                            {order.status === 'shipped' && (
                                                <button
                                                    onClick={(e) => onConfirmReceipt(order.id, e)}
                                                    className="px-4 py-2 bg-black text-white text-sm font-body hover:bg-gray-800 transition-colors"
                                                >
                                                    确认收货
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Refund Modal */}
            {refundOrder && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setRefundOrder(null)}>
                    <div className="bg-white p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <h3 className="font-display text-xl mb-4">申请退款</h3>
                        <p className="text-sm text-gray-500 mb-4">订单号: {refundOrder.order_number}</p>
                        <textarea
                            className="w-full border border-gray-300 p-3 text-sm mb-4 focus:outline-none focus:border-black"
                            placeholder="请输入退款原因"
                            rows={4}
                            value={refundReason}
                            onChange={e => setRefundReason(e.target.value)}
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setRefundOrder(null)}
                                className="px-4 py-2 border border-gray-300 text-sm hover:bg-gray-50"
                            >
                                取消
                            </button>
                            <button
                                onClick={submitRefund}
                                className="px-4 py-2 bg-black text-white text-sm hover:bg-gray-800"
                            >
                                提交申请
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {reviewItem && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setReviewItem(null)}>
                    <div className="bg-white p-6 max-w-lg w-full" onClick={e => e.stopPropagation()}>
                        <h3 className="font-display text-xl mb-4">评价商品</h3>
                        <div className="flex items-center gap-3 mb-4">
                            <img src={reviewItem.item.product_image} className="w-12 h-12 object-cover bg-gray-100" />
                            <span className="text-sm font-medium">{reviewItem.item.product_name}</span>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">评分</label>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        key={star}
                                        onClick={() => setReviewRating(star)}
                                        className="text-2xl focus:outline-none"
                                    >
                                        <span className={star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">评价内容</label>
                            <textarea
                                className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black"
                                placeholder="分享你的使用体验..."
                                rows={4}
                                value={reviewContent}
                                onChange={e => setReviewContent(e.target.value)}
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">晒图</label>
                            <div className="flex flex-wrap gap-2">
                                {reviewImages.map((url, i) => (
                                    <div key={i} className="relative w-16 h-16 border">
                                        <img src={url} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                                <label className="w-16 h-16 border border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-black">
                                    <span className="text-xl">+</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setReviewItem(null)}
                                className="px-4 py-2 border border-gray-300 text-sm hover:bg-gray-50"
                            >
                                取消
                            </button>
                            <button
                                onClick={submitReview}
                                className="px-4 py-2 bg-black text-white text-sm hover:bg-gray-800"
                            >
                                发布评价
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
