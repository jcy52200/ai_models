import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Package,
    Truck,
    CheckCircle,
    Clock,
    MapPin,
    Copy,
    Check,
    RefreshCw,
    XCircle,
    Phone,
    MessageCircle,
    Loader2
} from 'lucide-react';
import { getOrder, cancelOrder, confirmOrder, simulatePay } from '../services/orderService';
import type { OrderDetail as OrderDetailType } from '../services/orderService';
import { useAuth } from '../contexts';

// 订单状态配置
const statusConfig: Record<string, any> = {
    pending: {
        label: '待支付',
        icon: Clock,
        color: 'text-amber-500',
        bgColor: 'bg-amber-50',
        description: '请尽快完成支付',
    },
    paid: {
        label: '待发货',
        icon: Package,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
        description: '商家正在准备发货',
    },
    shipped: {
        label: '待收货',
        icon: Truck,
        color: 'text-purple-500',
        bgColor: 'bg-purple-50',
        description: '包裹正在派送中',
    },
    completed: {
        label: '已完成',
        icon: CheckCircle,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        description: '交易完成，感谢您的购买',
    },
    cancelled: {
        label: '已取消',
        icon: XCircle,
        color: 'text-gray-5',
        bgColor: 'bg-gray-2',
        description: '订单已取消',
    },
    refunded: {
        label: '已退款',
        icon: RefreshCw,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        description: '退款已完成',
    },
};

export default function OrderDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [order, setOrder] = useState<OrderDetailType | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (id) {
            fetchOrder(parseInt(id));
        }
    }, [id, isAuthenticated]);

    const fetchOrder = async (orderId: number) => {
        setLoading(true);
        try {
            const data = await getOrder(orderId);
            setOrder(data);
        } catch (error) {
            console.error('获取订单详情失败:', error);
            alert('获取订单详情失败');
        } finally {
            setLoading(false);
        }
    };

    const copyOrderNumber = () => {
        if (order) {
            navigator.clipboard.writeText(order.order_number);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handlePay = async () => {
        if (!order) return;
        if (!confirm('确定要支付吗？(模拟支付)')) return;

        setActionLoading(true);
        try {
            await simulatePay(order.id);
            alert('支付成功！');
            fetchOrder(order.id);
        } catch (error) {
            console.error('支付失败:', error);
            alert('支付失败');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!order) return;
        const reason = prompt('请输入取消原因：');
        if (reason === null) return; // 用户取消

        setActionLoading(true);
        try {
            await cancelOrder(order.id, reason || '不想买了');
            alert('订单已取消');
            fetchOrder(order.id);
        } catch (error) {
            console.error('取消订单失败:', error);
            alert('取消订单失败');
        } finally {
            setActionLoading(false);
        }
    };

    const handleConfirm = async () => {
        if (!order) return;
        if (!confirm('确认已收到商品吗？')) return;

        setActionLoading(true);
        try {
            await confirmOrder(order.id);
            alert('交易完成！');
            fetchOrder(order.id);
        } catch (error) {
            console.error('确认收货失败:', error);
            alert('确认收货失败');
        } finally {
            setActionLoading(false);
        }
    };

    const getPaymentMethodLabel = (method: string) => {
        const methods: Record<string, string> = {
            alipay: '支付宝',
            wechat: '微信支付',
            unionpay: '银联支付',
        };
        return methods[method] || method;
    };

    if (loading || !order) {
        return (
            <div className="min-h-screen bg-gray-2 pt-20 flex justify-center items-center">
                <Loader2 className="w-8 h-8 animate-spin text-black" />
            </div>
        );
    }

    const status = statusConfig[order.status] || statusConfig.pending;
    const StatusIcon = status.icon;

    return (
        <div className="min-h-screen bg-gray-2 pt-24 pb-16">
            <div className="w-full max-w-4xl mx-auto px-6">
                {/* 返回按钮 */}
                <button
                    onClick={() => navigate('/orders')}
                    className="flex items-center gap-2 text-gray-1 hover:text-black mb-6 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
                    <span className="text-sm font-body">返回订单列表</span>
                </button>

                {/* 订单状态卡片 */}
                <div className="bg-white p-6 sm:p-8 mb-4 animate-fade-in-up">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${status.bgColor}`}>
                                <StatusIcon className={`w-6 h-6 ${status.color}`} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h1 className="font-display text-2xl text-black">{status.label}</h1>
                                <p className="text-sm text-gray-1 font-body mt-1">{status.description}</p>
                            </div>
                        </div>
                        {/* 操作按钮 */}
                        <div className="flex gap-3">
                            {order.status === 'pending' && (
                                <>
                                    <button
                                        onClick={handleCancel}
                                        disabled={actionLoading}
                                        className="px-4 py-2 text-sm font-body text-gray-1 border border-gray-3 hover:border-black transition-colors duration-200 disabled:opacity-50"
                                    >
                                        取消订单
                                    </button>
                                    <button
                                        onClick={handlePay}
                                        disabled={actionLoading}
                                        className="px-4 py-2 text-sm font-body bg-black text-white hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50"
                                    >
                                        去支付
                                    </button>
                                </>
                            )}
                            {order.status === 'shipped' && (
                                <button
                                    onClick={handleConfirm}
                                    disabled={actionLoading}
                                    className="px-4 py-2 text-sm font-body bg-black text-white hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50"
                                >
                                    确认收货
                                </button>
                            )}
                            {order.status === 'completed' && (
                                <button
                                    onClick={() => navigate(`/product/${order.items[0]?.product_id}`)}
                                    className="px-4 py-2 text-sm font-body border border-black text-black hover:bg-black hover:text-white transition-colors duration-200"
                                >
                                    再次购买
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 订单基本信息 */}
                    <div className="mt-6 pt-6 border-t border-gray-3 flex flex-wrap gap-x-8 gap-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-5 font-body">订单号</span>
                            <span className="text-sm text-black font-body">{order.order_number}</span>
                            <button
                                onClick={copyOrderNumber}
                                className="p-1 hover:bg-gray-2 rounded transition-colors"
                            >
                                {copied ? (
                                    <Check className="w-4 h-4 text-green-500" strokeWidth={1.5} />
                                ) : (
                                    <Copy className="w-4 h-4 text-gray-5" strokeWidth={1.5} />
                                )}
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-5 font-body">下单时间</span>
                            <span className="text-sm text-black font-body">{new Date(order.created_at).toLocaleString()}</span>
                        </div>
                        {order.payment_method && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-5 font-body">支付方式</span>
                                <span className="text-sm text-black font-body">
                                    {getPaymentMethodLabel(order.payment_method)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 订单进度时间线 */}
                <div className="bg-white p-6 sm:p-8 mb-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <h2 className="font-display text-lg text-black mb-6">订单进度</h2>
                    <div className="relative">
                        {order.timelines.map((timeline, index) => (
                            <div key={index} className="flex gap-4 relative">
                                {/* 线条 */}
                                {index < order.timelines.length - 1 && (
                                    <div className="absolute left-[11px] top-6 w-0.5 h-full bg-gray-3" />
                                )}
                                {/* 圆点 */}
                                <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${index === order.timelines.length - 1
                                        ? 'bg-black'
                                        : 'bg-gray-3'
                                        }`}
                                >
                                    {index === order.timelines.length - 1 && (
                                        <Check className="w-3 h-3 text-white" strokeWidth={2} />
                                    )}
                                </div>
                                {/* 内容 */}
                                <div className="pb-6">
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`text-sm font-body ${index === order.timelines.length - 1
                                                ? 'text-black'
                                                : 'text-gray-5'
                                                }`}
                                        >
                                            {timeline.status_text}
                                        </span>
                                        <span className="text-xs text-gray-5 font-body">
                                            {new Date(timeline.time).toLocaleString()}
                                        </span>
                                    </div>
                                    {timeline.description && (
                                        <p className="text-sm text-gray-1 font-body mt-1">
                                            {timeline.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 收货地址 */}
                {order.shipping_address && (
                    <div className="bg-white p-6 sm:p-8 mb-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                        <h2 className="font-display text-lg text-black mb-4">收货地址</h2>
                        <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-gray-5 shrink-0 mt-0.5" strokeWidth={1.5} />
                            <div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-body text-black">
                                        {order.shipping_address.recipient_name}
                                    </span>
                                    <span className="text-sm font-body text-gray-1">
                                        {order.shipping_address.phone}
                                    </span>
                                </div>
                                <p className="text-sm font-body text-gray-1 mt-1">
                                    {order.shipping_address.province}
                                    {order.shipping_address.city}
                                    {order.shipping_address.district}
                                    {order.shipping_address.detail_address}
                                </p>
                            </div>
                        </div>
                        {order.note && (
                            <div className="mt-4 pt-4 border-t border-gray-3">
                                <span className="text-sm text-gray-5 font-body">订单备注：</span>
                                <span className="text-sm text-gray-1 font-body ml-2">{order.note}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* 商品列表 */}
                <div className="bg-white p-6 sm:p-8 mb-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                    <h2 className="font-display text-lg text-black mb-4">商品信息</h2>
                    <div className="space-y-4">
                        {order.items.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => navigate(`/product/${item.product_id}`)}
                                className="flex gap-4 cursor-pointer group"
                            >
                                <div className="w-20 h-20 bg-gray-2 overflow-hidden shrink-0">
                                    <img
                                        src={item.product_image || '/placeholder.jpg'}
                                        alt={item.product_name}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>
                                <div className="flex-1 min-w-0 flex justify-between">
                                    <div>
                                        <h3 className="text-sm font-body text-black group-hover:text-gray-1 transition-colors truncate">
                                            {item.product_name}
                                        </h3>
                                        <p className="text-sm font-display text-black mt-2">
                                            ¥{item.unit_price.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm text-gray-5 font-body">×{item.quantity}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 金额明细 */}
                <div className="bg-white p-6 sm:p-8 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                    <h2 className="font-display text-lg text-black mb-4">金额明细</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm font-body">
                            <span className="text-gray-1">商品总额</span>
                            <span className="text-black">¥{order.total_amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm font-body">
                            <span className="text-gray-1">运费</span>
                            <span className="text-black">
                                {order.shipping_fee === 0 ? '免运费' : `¥${order.shipping_fee}`}
                            </span>
                        </div>
                        <div className="pt-4 border-t border-gray-3 flex justify-between items-baseline">
                            <span className="text-sm text-gray-1 font-body">实付款</span>
                            <span className="font-display text-2xl text-black">
                                ¥{(order.total_amount + order.shipping_fee).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 底部操作 */}
                <div className="mt-6 flex justify-between items-center animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                    <button
                        onClick={() => {/* TODO: 联系客服 */ }}
                        className="flex items-center gap-2 text-sm text-gray-1 font-body hover:text-black transition-colors"
                    >
                        <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
                        联系客服
                    </button>
                    <button
                        onClick={() => {/* TODO: 拨打电话 */ }}
                        className="flex items-center gap-2 text-sm text-gray-1 font-body hover:text-black transition-colors"
                    >
                        <Phone className="w-4 h-4" strokeWidth={1.5} />
                        400-888-8888
                    </button>
                </div>
            </div>
        </div>
    );
}
