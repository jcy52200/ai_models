import React from 'react';
import { X, MapPin, FileText, Package, Clock } from 'lucide-react';
import type { OrderDetail } from '../../services/orderService';

interface OrderDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: OrderDetail | null;
    loading: boolean;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
    isOpen,
    onClose,
    order,
    loading
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col m-4 shadow-xl">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold font-serif text-gray-900">订单详情</h2>
                        {order && <p className="text-gray-500 text-sm mt-1 font-mono">#{order.order_number}</p>}
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {loading ? (
                        <div className="flex py-20 justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                        </div>
                    ) : order ? (
                        <div className="space-y-6">
                            {/* Status Banner */}
                            <div className={`p-4 rounded-lg flex items-center justify-between ${order.status === 'completed' ? 'bg-green-50 border border-green-100' :
                                order.status === 'cancelled' ? 'bg-gray-100 border border-gray-200' :
                                    'bg-blue-50 border border-blue-100'
                                }`}>
                                <div className="flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-gray-700" />
                                    <div>
                                        <p className="font-semibold text-gray-900">{order.status_text}</p>
                                        <p className="text-sm text-gray-600">下单时间: {new Date(order.created_at).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="text-xl font-bold font-serif text-gray-900">
                                    ¥{Number(order.total_amount).toFixed(2)}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Order Notes */}
                                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                                    <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                                        <FileText className="w-4 h-4" /> 订单备注
                                    </h3>
                                    <div className="text-sm text-gray-600">
                                        {order.note ? (
                                            <p className="whitespace-pre-wrap">{order.note}</p>
                                        ) : (
                                            <p className="text-gray-400 italic">无备注</p>
                                        )}
                                    </div>
                                </div>

                                {/* Shipping Info */}
                                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                                    <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                                        <MapPin className="w-4 h-4" /> 收货信息
                                    </h3>
                                    {order.shipping_address ? (
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">收货人:</span>
                                                <span className="font-medium text-gray-900">{order.shipping_address.recipient_name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">联系电话:</span>
                                                <span className="font-medium text-gray-900">{order.shipping_address.phone}</span>
                                            </div>
                                            <div className="border-t border-gray-50 pt-2 mt-2">
                                                <p className="text-gray-600 leading-relaxed">
                                                    {order.shipping_address.province} {order.shipping_address.city} {order.shipping_address.district}
                                                    <br />
                                                    {order.shipping_address.detail_address}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-sm">无收货信息</p>
                                    )}
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                                <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                                    <Package className="w-4 h-4" />
                                    <h3 className="font-semibold text-gray-900">商品清单</h3>
                                </div>
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商品</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">单价</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">数量</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">小计</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {order.items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100">
                                                            {item.product_image && (
                                                                <img className="h-10 w-10 object-cover" src={item.product_image} alt="" />
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{item.product_name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                                    ¥{Number(item.unit_price).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                                    x{item.quantity}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                                    ¥{Number(item.subtotal).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Timeline */}
                            {order.timelines && order.timelines.length > 0 && (
                                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                                    <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">订单进度</h3>
                                    <div className="space-y-6 ml-2">
                                        {order.timelines.map((timeline, index) => (
                                            <div key={index} className="relative flex gap-4 pb-0 last:pb-0">
                                                {index !== order.timelines.length - 1 && (
                                                    <div className="absolute left-[7px] top-6 bottom-[-24px] w-[2px] bg-gray-100"></div>
                                                )}
                                                <div className="flex-shrink-0 mt-1">
                                                    <div className="w-4 h-4 rounded-full bg-black ring-4 ring-gray-50"></div>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{timeline.status_text || timeline.status}</p>
                                                    <p className="text-sm text-gray-500 mt-1">{new Date(timeline.time).toLocaleString()}</p>
                                                    {timeline.description && (
                                                        <p className="text-sm text-gray-600 mt-1">{timeline.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-gray-500">
                            无法加载订单详情
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors bg-white text-gray-700"
                    >
                        关闭
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailModal;
