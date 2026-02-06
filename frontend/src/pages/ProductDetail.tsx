import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Heart,
  Share2,
  ShoppingBag,
  Check,
  Plus,
  Minus,
  ThumbsUp
} from 'lucide-react';
import { getProduct, getRelatedProducts } from '../services/productService';
import type { ProductDetail as ProductDetailType, ProductListItem } from '../services/productService';
import { getProductReviews, likeReview, unlikeReview } from '../services/reviewService';
import type { ProductReview } from '../services/reviewService';
import { addToCart } from '../services/cartService';
import { toggleFavorite, checkFavoriteStatus } from '../services/favoriteService';
import { useAuth, useCart, useToast } from '../contexts';

// 商品详情组件
export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { refreshCart } = useCart();
  const { showToast } = useToast();

  const [product, setProduct] = useState<ProductDetailType | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductListItem[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewsSummary, setReviewsSummary] = useState({
    total: 0,
    averageRating: 0,
    counts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>
  });

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'params' | 'reviews'>('details');
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const productId = parseInt(id);

        // 并行请求商品详情、相关推荐、评价列表
        const [productData, relatedData, reviewsData] = await Promise.all([
          getProduct(productId),
          getRelatedProducts(productId),
          getProductReviews(productId, { page_size: 100 })
        ]);

        if (isAuthenticated) {
          try {
            const favStatus = await checkFavoriteStatus(productId);
            setIsFavorite(favStatus.is_favorite);
          } catch (e) {
            console.error('获取收藏状态失败', e);
          }
        }

        setProduct(productData);
        setRelatedProducts(relatedData);
        setReviews(reviewsData.list);

        // 计算评价统计
        if (reviewsData.list.length > 0) {
          const total = reviewsData.list.length;
          const sum = reviewsData.list.reduce((acc, r) => acc + r.rating, 0);
          const counts = reviewsData.list.reduce((acc, r) => {
            acc[r.rating] = (acc[r.rating] || 0) + 1;
            return acc;
          }, {} as Record<number, number>);

          setReviewsSummary({
            total,
            averageRating: Number((sum / total).toFixed(1)),
            counts
          });
        }

        setIsVisible(true);
      } catch (error) {
        console.error('获取商品详情失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  const nextImage = () => {
    if (!product) return;
    const images = [product.main_image_url, ...(product.image_urls || [])].filter(Boolean);
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (!product) return;
    const images = [product.main_image_url, ...(product.image_urls || [])].filter(Boolean);
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!product) return;

    try {
      await addToCart(product.id, quantity);
      await refreshCart();
      showToast(`已将 ${quantity} 件商品加入购物车`, 'success');
    } catch (error) {
      console.error('加入购物车失败:', error);
      showToast('加入购物车失败，请重试', 'error');
    }
  };

  const buyNow = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!product) return;

    try {
      await addToCart(product.id, quantity);
      await refreshCart();
      navigate('/cart');
    } catch (error) {
      console.error('操作失败:', error);
      showToast('操作失败，请重试', 'error');
    }
  };

  const handleLikeReview = async (review: ProductReview) => {
    if (!isAuthenticated) return;
    try {
      if (review.is_liked) {
        await unlikeReview(review.id);
      } else {
        await likeReview(review.id);
      }
      // 更新本地状态
      setReviews(reviews.map(r =>
        r.id === review.id
          ? { ...r, is_liked: !r.is_liked, like_count: r.is_liked ? r.like_count - 1 : r.like_count + 1 }
          : r
      ));
    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-white pt-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  const allImages = [product.main_image_url, ...(product.image_urls || [])].filter(Boolean);
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div ref={sectionRef} className="min-h-screen bg-white pt-20">
      {/* Breadcrumb */}
      <div className="w-full px-6 lg:px-12 py-4 border-b border-gray-3">
        <div className="flex items-center gap-2 text-sm text-gray-1 font-body">
          <button onClick={() => navigate('/')} className="hover:text-black transition-colors">首页</button>
          <ChevronLeft className="w-4 h-4 rotate-180" />
          <button onClick={() => navigate(`/search?category=${product.category?.id}`)} className="hover:text-black transition-colors">
            {product.category?.name || '所有商品'}
          </button>
          <ChevronLeft className="w-4 h-4 rotate-180" />
          <span className="text-black">{product.name}</span>
        </div>
      </div>

      <div className="w-full px-6 lg:px-12 py-8 lg:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Left: Image Gallery */}
            <div
              className={`transition-all duration-800 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}
              style={{ transitionTimingFunction: 'var(--ease-expo-out)' }}
            >
              {/* Main Image */}
              <div className="relative aspect-square bg-gray-2 overflow-hidden">
                <img
                  src={allImages[currentImageIndex] || '/placeholder.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />

                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Tags */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {product.tags?.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-3 py-1 text-xs text-white font-body"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name}
                    </span>
                  ))}
                  {discount > 0 && (
                    <span className="px-3 py-1 text-xs text-white font-body bg-red-500">
                      -{discount}%
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnail Gallery */}
              <div className="flex gap-3 mt-4 overflow-x-auto scrollbar-hide">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 border-2 overflow-hidden transition-all ${index === currentImageIndex ? 'border-black' : 'border-transparent'
                      }`}
                  >
                    <img src={image || '/placeholder.jpg'} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Product Info */}
            <div
              className={`transition-all duration-800 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
              style={{ transitionDelay: '100ms', transitionTimingFunction: 'var(--ease-expo-out)' }}
            >
              {/* Title & Actions */}
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="font-display text-3xl lg:text-4xl text-black">{product.name}</h1>
                  <p className="mt-2 text-gray-1 font-body">{product.description?.slice(0, 50)}...</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      if (!isAuthenticated) {
                        navigate('/login');
                        return;
                      }
                      try {
                        const res = await toggleFavorite(product.id);
                        setIsFavorite(res.is_favorite);
                        showToast(res.message, 'success');
                      } catch (error) {
                        console.error('操作失败', error);
                        showToast('操作失败', 'error');
                      }
                    }}
                    className={`p-3 border transition-all ${isFavorite ? 'bg-black text-white border-black' : 'border-gray-3 hover:border-black'}`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-white' : ''}`} />
                  </button>
                  <button className="p-3 border border-gray-3 hover:border-black transition-all">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(reviewsSummary.averageRating) ? 'fill-black text-black' : 'text-gray-3'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-1 font-body">
                  {reviewsSummary.averageRating} ({reviewsSummary.total}条评价)
                </span>
                <span className="text-sm text-gray-1 font-body">|</span>
                <span className="text-sm text-gray-1 font-body">已售 {product.sales_count}+</span>
              </div>

              {/* Price */}
              <div className="mt-6 p-6 bg-gray-2">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-3xl text-black">¥{product.price.toLocaleString()}</span>
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-gray-1 line-through font-body">¥{product.original_price.toLocaleString()}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm text-green-600 font-body">
                  <Check className="w-4 h-4" />
                  <span>库存充足 ({product.stock}件)</span>
                </div>
              </div>

              {/* Quantity */}
              <div className="mt-6">
                <span className="text-sm font-body text-gray-1">数量</span>
                <div className="flex items-center gap-0 mt-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 border border-gray-3 flex items-center justify-center hover:border-black transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-16 h-12 border-t border-b border-gray-3 flex items-center justify-center font-body">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-12 h-12 border border-gray-3 flex items-center justify-center hover:border-black transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 h-14 border border-black flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span className="font-body tracking-wider">加入购物车</span>
                </button>
                <button
                  onClick={buyNow}
                  className="flex-1 h-14 bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors"
                >
                  <span className="font-body tracking-wider">立即购买</span>
                </button>
              </div>

              {/* Service Promise */}
              <div className="flex flex-wrap gap-4 mt-6 text-sm text-gray-1 font-body">
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4" /> 正品保证
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4" /> 7天无理由退换
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4" /> 免费配送
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4" /> 3年质保
                </span>
              </div>
            </div>
          </div>

          {/* Tabs & Content */}
          <div className="mt-16 lg:mt-24">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-3">
              {[
                { key: 'details', label: '商品详情' },
                { key: 'params', label: '规格参数' },
                { key: 'reviews', label: `用户评价 (${reviewsSummary.total})` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`px-8 py-4 font-body text-sm tracking-wider transition-all relative ${activeTab === tab.key ? 'text-black' : 'text-gray-1 hover:text-black'
                    }`}
                >
                  {tab.label}
                  {activeTab === tab.key && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-black" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="py-8 lg:py-12">
              {/* Details Tab */}
              {activeTab === 'details' && (
                <div className="max-w-3xl">
                  <div className="prose prose-lg max-w-none">
                    {product.description?.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="text-gray-1 font-body leading-relaxed mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  <div className="mt-8 grid grid-cols-2 gap-4">
                    {product.image_urls?.map((image, index) => (
                      <img key={index} src={image} alt="" className="w-full aspect-square object-cover" />
                    ))}
                  </div>
                </div>
              )}

              {/* Params Tab */}
              {activeTab === 'params' && (
                <div className="max-w-2xl">
                  {product.params && product.params.length > 0 ? (
                    <table className="w-full">
                      <tbody>
                        {product.params.map((attr, index) => (
                          <tr key={index} className="border-b border-gray-3">
                            <td className="py-4 w-1/3 text-gray-1 font-body">{attr.name}</td>
                            <td className="py-4 font-body">{attr.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-gray-500 text-center py-8">暂无规格参数</div>
                  )}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div>
                  {/* Rating Summary */}
                  <div className="flex items-center gap-8 p-6 bg-gray-2 mb-8">
                    <div className="text-center">
                      <div className="font-display text-5xl text-black">{reviewsSummary.averageRating}</div>
                      <div className="flex items-center gap-1 mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(reviewsSummary.averageRating) ? 'fill-black text-black' : 'text-gray-3'}`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-1 mt-1 font-body">{reviewsSummary.total}条评价</div>
                    </div>
                    <div className="flex-1 space-y-2">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = reviewsSummary.counts[rating] || 0;
                        const percentage = reviewsSummary.total > 0 ? (count / reviewsSummary.total) * 100 : 0;
                        return (
                          <div key={rating} className="flex items-center gap-3">
                            <span className="text-sm text-gray-1 font-body w-8">{rating}星</span>
                            <div className="flex-1 h-2 bg-gray-3 rounded-full overflow-hidden">
                              <div className="h-full bg-black" style={{ width: `${percentage}%` }} />
                            </div>
                            <span className="text-sm text-gray-1 font-body w-10">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Review List */}
                  <div className="space-y-8">
                    {reviews.length > 0 ? reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-3 pb-8">
                        <div className="flex items-start gap-4">
                          <img
                            src={review.user.avatar_url || `https://ui-avatars.com/api/?name=${review.user.username}&background=random`}
                            alt={review.user.username}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <span className="font-body text-sm">{review.user.username}</span>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${i < review.rating ? 'fill-black text-black' : 'text-gray-3'}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="mt-3 text-gray-1 font-body leading-relaxed">{review.content}</p>
                            {review.image_urls && review.image_urls.length > 0 && (
                              <div className="flex gap-2 mt-3">
                                {review.image_urls.map((url, index) => (
                                  <img key={index} src={url} alt="" className="w-20 h-20 object-cover" />
                                ))}
                              </div>
                            )}
                            <div className="flex items-center gap-4 mt-4 text-sm text-gray-1 font-body">
                              <span>{new Date(review.created_at).toLocaleDateString()}</span>
                              <button
                                onClick={() => handleLikeReview(review)}
                                className={`flex items-center gap-1 transition-colors ${review.is_liked ? 'text-black' : 'hover:text-black'}`}
                              >
                                <ThumbsUp className={`w-4 h-4 ${review.is_liked ? 'fill-black' : ''}`} />
                                <span>{review.like_count}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-gray-500">暂无评价</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-16 lg:mt-24">
              <h2 className="font-display text-2xl lg:text-3xl text-black mb-8">相关推荐</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                {relatedProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      navigate(`/product/${p.id}`);
                      window.scrollTo(0, 0);
                    }}
                    className="group cursor-pointer"
                  >
                    <div className="aspect-square bg-gray-2 overflow-hidden">
                      <img
                        src={p.main_image_url || '/placeholder.jpg'}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <h3 className="mt-4 font-body text-sm text-black group-hover:text-gray-1 transition-colors">{p.name}</h3>
                    <p className="mt-1 font-display text-lg text-black">¥{p.price.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
