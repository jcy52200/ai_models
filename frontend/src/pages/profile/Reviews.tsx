import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Star, Loader2, Image as ImageIcon } from 'lucide-react';
import { getUserReviews } from '../../services/reviewService';
import type { ProductReview } from '../../services/reviewService';

interface UserReview extends ProductReview {
    product: {
        id: number;
        name: string;
        main_image_url: string;
    };
}

export default function Reviews() {
    const [reviews, setReviews] = useState<UserReview[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        setLoading(true);
        try {
            const data = await getUserReviews({ page_size: 100 });
            setReviews(data.list);
        } catch (error) {
            console.error('加载评价失败:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="bg-white p-12 text-center">
                <Star className="w-16 h-16 mx-auto text-gray-3" />
                <p className="mt-4 text-gray-1 font-body">暂无评价记录</p>
                <NavLink to="/orders" className="inline-block mt-4 px-6 py-2 border border-black text-sm font-body hover:bg-black hover:text-white transition-colors">
                    去评价订单
                </NavLink>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="font-display text-xl text-black">我的评价</h2>
            <div className="grid gap-6">
                {reviews.map((review) => (
                    <div key={review.id} className="bg-white border border-gray-2 p-6 transition-colors hover:border-black">
                        <div className="flex gap-6">
                            {/* Product Info */}
                            <NavLink to={`/product/${review.product.id}`} className="shrink-0 w-24 h-24 bg-gray-100 block">
                                {review.product.main_image_url ? (
                                    <img src={review.product.main_image_url} alt={review.product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <ImageIcon className="w-8 h-8" />
                                    </div>
                                )}
                            </NavLink>

                            {/* Review Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-2">
                                    <NavLink to={`/product/${review.product.id}`} className="font-body font-medium truncate hover:underline">
                                        {review.product.name}
                                    </NavLink>
                                    <span className="text-sm text-gray-400 whitespace-nowrap">
                                        {new Date(review.created_at).toLocaleDateString()}
                                    </span>
                                </div>

                                {/* Rating */}
                                <div className="flex items-center gap-1 mb-3">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < review.rating ? 'fill-black text-black' : 'text-gray-3'}`}
                                        />
                                    ))}
                                </div>

                                {/* Content */}
                                <p className="text-gray-600 font-body mb-4">{review.content}</p>

                                {/* Images */}
                                {review.image_urls && review.image_urls.length > 0 && (
                                    <div className="flex gap-2">
                                        {review.image_urls.map((url, index) => (
                                            <div key={index} className="w-16 h-16 bg-gray-50 border border-gray-2">
                                                <img src={url} alt={`Review image ${index + 1}`} className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Stats */}
                                {review.like_count > 0 && (
                                    <div className="mt-3 text-sm text-gray-400">
                                        {review.like_count} 人觉得有帮助
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
