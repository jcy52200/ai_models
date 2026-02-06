import React, { useState, useEffect } from 'react';
import { Star, Check, X, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../contexts';
import { useConfirm } from '../../hooks/useConfirm';
import ConfirmModal from '../../components/ConfirmModal';

interface Review {
    id: number;
    user: {
        id: number;
        username: string;
        avatar_url: string | null;
    };
    product: {
        id: number;
        name: string;
        main_image_url: string | null;
    };
    rating: number;
    content: string;
    is_approved: boolean;
    like_count: number;
    created_at: string;
}

const ReviewList: React.FC = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [ratingFilter, setRatingFilter] = useState<string>('');
    const pageSize = 10;
    const { showToast } = useToast();
    const { confirm, confirmProps } = useConfirm();

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const params: Record<string, any> = { page, page_size: pageSize };
            if (statusFilter) params.status = statusFilter;
            if (ratingFilter) params.rating = parseInt(ratingFilter);

            const res = await api.get('/admin/reviews', { params });
            setReviews(res.data.data.list);
            setTotal(res.data.data.pagination.total);
        } catch (err) {
            console.error('Failed to fetch reviews:', err);
            showToast('获取评价列表失败', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [page, statusFilter, ratingFilter]);

    const handleApprove = async (id: number) => {
        try {
            await api.put(`/admin/reviews/${id}/approve`);
            showToast('评价已通过', 'success');
            fetchReviews();
        } catch (err) {
            console.error('Failed to approve review:', err);
            showToast('操作失败', 'error');
        }
    };

    const handleReject = async (id: number) => {
        try {
            await api.put(`/admin/reviews/${id}/reject`);
            showToast('评价已拒绝', 'success');
            fetchReviews();
        } catch (err) {
            console.error('Failed to reject review:', err);
            showToast('操作失败', 'error');
        }
    };

    const handleDelete = async (id: number) => {
        const confirmed = await confirm({
            title: '删除评价',
            message: '确定要删除这条评价吗？此操作不可恢复。',
            confirmText: '删除',
            variant: 'danger'
        });
        if (!confirmed) return;

        try {
            await api.delete(`/admin/reviews/${id}`);
            showToast('评价已删除', 'success');
            fetchReviews();
        } catch (err) {
            console.error('Failed to delete review:', err);
            showToast('删除失败', 'error');
        }
    };

    const totalPages = Math.ceil(total / pageSize);

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                        key={i}
                        className={`w-4 h-4 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="bg-white p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-xl text-black">评价管理</h1>
                <div className="flex gap-4">
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="h-10 px-4 border border-gray-3 focus:border-black focus:outline-none font-body text-sm"
                    >
                        <option value="">全部状态</option>
                        <option value="approved">已通过</option>
                        <option value="rejected">已拒绝</option>
                    </select>
                    <select
                        value={ratingFilter}
                        onChange={(e) => { setRatingFilter(e.target.value); setPage(1); }}
                        className="h-10 px-4 border border-gray-3 focus:border-black focus:outline-none font-body text-sm"
                    >
                        <option value="">全部评分</option>
                        <option value="5">5星</option>
                        <option value="4">4星</option>
                        <option value="3">3星</option>
                        <option value="2">2星</option>
                        <option value="1">1星</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-1 font-body">加载中...</div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-12 text-gray-1 font-body">暂无评价</div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div key={review.id} className="border border-gray-3 p-4">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4 flex-1">
                                    {/* Product image */}
                                    <div className="w-16 h-16 bg-gray-2 flex-shrink-0">
                                        {review.product.main_image_url && (
                                            <img
                                                src={review.product.main_image_url}
                                                alt={review.product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-body text-sm text-gray-1">{review.user.username}</span>
                                            {renderStars(review.rating)}
                                            <span className={`text-xs px-2 py-0.5 ${review.is_approved ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                {review.is_approved ? '已通过' : '已拒绝'}
                                            </span>
                                        </div>
                                        <p className="font-body text-sm text-gray-1 mb-1 truncate">{review.product.name}</p>
                                        <p className="font-body text-sm text-black">{review.content}</p>
                                        <p className="font-body text-xs text-gray-5 mt-2">
                                            {new Date(review.created_at).toLocaleString()} · 点赞 {review.like_count}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 ml-4">
                                    <button
                                        onClick={() => handleApprove(review.id)}
                                        className="p-2 hover:bg-green-50 text-green-600 transition-colors"
                                        title="通过"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleReject(review.id)}
                                        className="p-2 hover:bg-red-50 text-red-600 transition-colors"
                                        title="拒绝"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(review.id)}
                                        className="p-2 hover:bg-gray-2 text-gray-1 transition-colors"
                                        title="删除"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
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

            {/* Confirm Modal */}
            <ConfirmModal {...confirmProps} />
        </div>
    );
};

export default ReviewList;
