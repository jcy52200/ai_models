import React, { useEffect, useState } from 'react';
import { getAllOrders, updateOrderStatus, getAdminOrderDetail } from '../../services/adminService';

import type { OrderListItem, OrderDetail } from '../../services/orderService';
import { Loader2, Check, Truck, Eye } from 'lucide-react';
import OrderDetailModal from '../../components/admin/OrderDetailModal';

const OrderList: React.FC = () => {
    const [orders, setOrders] = useState<OrderListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const pageSize = 20;

    useEffect(() => {
        loadOrders();
    }, [page, statusFilter]);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const data = await getAllOrders({
                page,
                page_size: pageSize,
                status: statusFilter || undefined
            });
            setOrders(data.list);
            setTotal(data.pagination.total);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: number, status: string) => {
        if (!confirm('确定要更新订单状态吗？')) return;
        try {
            await updateOrderStatus(id, status);
            loadOrders(); // 重新加载
        } catch (error) {
            alert('更新失败');
        }
    };

    const handleViewOrder = async (id: number) => {
        setIsModalOpen(true);
        setDetailLoading(true);
        setSelectedOrder(null);
        try {
            const detail = await getAdminOrderDetail(id);
            setSelectedOrder(detail);
        } catch (error) {
            console.error('获取订单详情失败', error);
            alert('获取订单详情失败');
            setIsModalOpen(false);
        } finally {
            setDetailLoading(false);
        }
    };

    const statusMap: Record<string, { label: string; color: string }> = {
        pending: { label: '待支付', color: 'bg-yellow-100 text-yellow-800' },
        paid: { label: '待发货', color: 'bg-blue-100 text-blue-800' },
        shipped: { label: '待收货', color: 'bg-indigo-100 text-indigo-800' },
        completed: { label: '已完成', color: 'bg-green-100 text-green-800' },
        cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-800' },
        refunded: { label: '已退款', color: 'bg-red-100 text-red-800' },
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-normal text-gray-900 font-serif">订单管理</h2>
                <select
                    className="border-gray-300 focus:border-black focus:ring-0 rounded-none px-4 py-2 font-sans"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">全部状态</option>
                    <option value="pending">待支付</option>
                    <option value="paid">待发货</option>
                    <option value="shipped">已发货</option>
                    <option value="completed">已完成</option>
                    <option value="cancelled">已取消</option>
                </select>
            </div>

            <div className="bg-white border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-sans">订单号</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-sans">金额</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-sans">状态</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-sans">创建时间</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider font-sans">操作</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 font-sans">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center">
                                    <div className="flex justify-center">
                                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                                    </div>
                                </td>
                            </tr>
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">暂无订单</td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-mono">{order.order_number}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-serif">¥{Number(order.total_amount).toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold uppercase tracking-wider ${order.status === 'completed' ? 'bg-black text-white' :
                                            order.status === 'cancelled' ? 'bg-gray-200 text-gray-600' :
                                                'bg-gray-100 text-gray-900 border border-gray-200'
                                            }`}>
                                            {statusMap[order.status]?.label || order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(order.created_at).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        {order.status === 'paid' && (
                                            <button
                                                onClick={() => handleStatusUpdate(order.id, 'shipped')}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="发货"
                                            >
                                                <Truck className="w-4 h-4" />
                                            </button>
                                        )}
                                        {order.status === 'shipped' && (
                                            <button
                                                onClick={() => handleStatusUpdate(order.id, 'completed')}
                                                className="text-green-600 hover:text-green-900"
                                                title="完成"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleViewOrder(order.id)}
                                            className="text-gray-600 hover:text-black"
                                            title="查看详情"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {/* 分页 */}
            <div className="flex justify-between items-center bg-white px-4 py-3 sm:px-6 border border-gray-200">
                <div className="text-sm text-gray-700 font-sans">
                    显示 {(page - 1) * pageSize + 1} 到 {Math.min(page * pageSize, total)} 条，共 {total} 条
                </div>
                <div className="flex space-x-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-4 py-2 border border-gray-300 text-sm hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-black"
                    >
                        上一页
                    </button>
                    <button
                        disabled={page * pageSize >= total}
                        onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 border border-gray-300 text-sm hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-black"
                    >
                        下一页
                    </button>
                </div>
            </div>
            {/* Modal */}
            <OrderDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                order={selectedOrder}
                loading={detailLoading}
            />
        </div>
    );
};

export default OrderList;
