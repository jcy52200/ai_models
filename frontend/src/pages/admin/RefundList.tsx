import React, { useState, useEffect } from 'react';
import { Check, X, ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';

interface Refund {
    id: number;
    order_id: number;
    order_no: string;
    user: {
        id: number;
        username: string;
    };
    refund_amount: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    admin_notes: string | null;
    created_at: string;
    processed_at: string | null;
}

const RefundList: React.FC = () => {
    const [refunds, setRefunds] = useState<Refund[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [actionModal, setActionModal] = useState<{ refund: Refund; action: 'approve' | 'reject' } | null>(null);
    const [adminNotes, setAdminNotes] = useState('');
    const pageSize = 10;

    const fetchRefunds = async () => {
        setLoading(true);
        try {
            const params: Record<string, any> = { page, page_size: pageSize };
            if (statusFilter) params.status = statusFilter;

            const res = await api.get('/admin/refunds', { params });
            setRefunds(res.data.data.list);
            setTotal(res.data.data.pagination.total);
        } catch (err) {
            console.error('Failed to fetch refunds:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRefunds();
    }, [page, statusFilter]);

    const handleAction = async () => {
        if (!actionModal) return;

        try {
            const endpoint = actionModal.action === 'approve'
                ? `/admin/refunds/${actionModal.refund.id}/approve`
                : `/admin/refunds/${actionModal.refund.id}/reject`;

            await api.put(endpoint, { admin_notes: adminNotes });
            setActionModal(null);
            setAdminNotes('');
            fetchRefunds();
        } catch (err) {
            console.error(`Failed to ${actionModal.action} refund:`, err);
        }
    };

    const getStatusBadge = (status: Refund['status']) => {
        const configs = {
            pending: { icon: Clock, bg: 'bg-yellow-100', text: 'text-yellow-600', label: '待处理' },
            approved: { icon: CheckCircle, bg: 'bg-green-100', text: 'text-green-600', label: '已批准' },
            rejected: { icon: XCircle, bg: 'bg-red-100', text: 'text-red-600', label: '已拒绝' },
            completed: { icon: CheckCircle, bg: 'bg-blue-100', text: 'text-blue-600', label: '已完成' },
        };
        const config = configs[status];
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs ${config.bg} ${config.text}`}>
                <Icon className="w-3 h-3" />
                {config.label}
            </span>
        );
    };

    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className="bg-white p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-xl text-black">退款管理</h1>
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="h-10 px-4 border border-gray-3 focus:border-black focus:outline-none font-body text-sm"
                >
                    <option value="">全部状态</option>
                    <option value="pending">待处理</option>
                    <option value="approved">已批准</option>
                    <option value="rejected">已拒绝</option>
                </select>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-1 font-body">加载中...</div>
            ) : refunds.length === 0 ? (
                <div className="text-center py-12 text-gray-1 font-body">暂无退款申请</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-3">
                                <th className="text-left py-3 px-4 font-body text-sm text-gray-1">订单号</th>
                                <th className="text-left py-3 px-4 font-body text-sm text-gray-1">用户</th>
                                <th className="text-left py-3 px-4 font-body text-sm text-gray-1">金额</th>
                                <th className="text-left py-3 px-4 font-body text-sm text-gray-1">原因</th>
                                <th className="text-left py-3 px-4 font-body text-sm text-gray-1">状态</th>
                                <th className="text-left py-3 px-4 font-body text-sm text-gray-1">申请时间</th>
                                <th className="text-left py-3 px-4 font-body text-sm text-gray-1">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {refunds.map((refund) => (
                                <tr key={refund.id} className="border-b border-gray-3 hover:bg-gray-2 transition-colors">
                                    <td className="py-3 px-4 font-body text-sm">{refund.order_no}</td>
                                    <td className="py-3 px-4 font-body text-sm">{refund.user.username}</td>
                                    <td className="py-3 px-4 font-body text-sm font-medium">¥{refund.refund_amount.toFixed(2)}</td>
                                    <td className="py-3 px-4 font-body text-sm text-gray-1 max-w-[200px] truncate">{refund.reason}</td>
                                    <td className="py-3 px-4">{getStatusBadge(refund.status)}</td>
                                    <td className="py-3 px-4 font-body text-sm text-gray-1">
                                        {new Date(refund.created_at).toLocaleString()}
                                    </td>
                                    <td className="py-3 px-4">
                                        {refund.status === 'pending' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setActionModal({ refund, action: 'approve' })}
                                                    className="p-1.5 hover:bg-green-50 text-green-600 transition-colors"
                                                    title="批准"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setActionModal({ refund, action: 'reject' })}
                                                    className="p-1.5 hover:bg-red-50 text-red-600 transition-colors"
                                                    title="拒绝"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                        {refund.admin_notes && (
                                            <span className="text-xs text-gray-5 block mt-1">备注: {refund.admin_notes}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 border border-gray-3 disabled:opacity-50"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-body text-sm text-gray-1 px-4">
                        {page} / {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-2 border border-gray-3 disabled:opacity-50"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Action Modal */}
            {actionModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 w-full max-w-md">
                        <h2 className="font-display text-lg mb-4">
                            {actionModal.action === 'approve' ? '批准退款' : '拒绝退款'}
                        </h2>
                        <p className="font-body text-sm text-gray-1 mb-4">
                            订单号: {actionModal.refund.order_no}<br />
                            退款金额: ¥{actionModal.refund.refund_amount.toFixed(2)}
                        </p>
                        <textarea
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            placeholder="处理备注（可选）"
                            className="w-full h-24 px-4 py-3 border border-gray-3 focus:border-black focus:outline-none font-body text-sm resize-none"
                        />
                        <div className="flex gap-4 mt-4">
                            <button
                                onClick={() => { setActionModal(null); setAdminNotes(''); }}
                                className="flex-1 h-10 border border-gray-3 font-body text-sm hover:bg-gray-2 transition-colors"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleAction}
                                className={`flex-1 h-10 font-body text-sm text-white transition-colors ${actionModal.action === 'approve'
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-red-600 hover:bg-red-700'
                                    }`}
                            >
                                确认{actionModal.action === 'approve' ? '批准' : '拒绝'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RefundList;
