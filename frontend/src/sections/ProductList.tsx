import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../services/productService';
import type { ProductListItem } from '../services/productService';
import { addToCart } from '../services/cartService';
import { useAuth, useCart, useToast } from '../contexts';

export default function ProductList() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { refreshCart } = useCart();
  const { showToast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 获取精选商品（比如按销量排序截取前8个）
    const fetchProducts = async () => {
      try {
        const { list } = await getProducts({
          page: 1,
          page_size: 8,
          sort_by: 'sales', // 或 'popular'
          is_published: true
        });
        setProducts(list);
      } catch (error) {
        console.error('获取商品失败:', error);
      }
    };
    fetchProducts();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleAddToCart = async (e: React.MouseEvent, productId: number) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await addToCart(productId, 1);
      await refreshCart();
      showToast('已加入购物车', 'success');
    } catch (error) {
      console.error('加入购物车失败:', error);
      showToast('加入购物车失败，请重试', 'error');
    }
  };

  return (
    <section
      id="products"
      ref={sectionRef}
      className="relative w-full py-24 lg:py-32 bg-gray-2"
    >
      <div className="w-full px-6 lg:px-12">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2
              className={`font-display text-3xl sm:text-4xl lg:text-5xl text-black transition-all duration-800 ${isVisible
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 -translate-x-10'
                }`}
              style={{ transitionTimingFunction: 'var(--ease-expo-out)' }}
            >
              精选产品
            </h2>
            <p
              className={`mt-4 text-gray-1 text-base font-body transition-all duration-800 ${isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-6'
                }`}
              style={{
                transitionDelay: '100ms',
                transitionTimingFunction: 'var(--ease-expo-out)',
              }}
            >
              发现我们最受欢迎的家具单品
            </p>
          </div>

          <a
            href="/search"
            className={`hidden sm:flex items-center gap-2 text-black group transition-all duration-800 ${isVisible
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 translate-x-10'
              }`}
            style={{
              transitionDelay: '100ms',
              transitionTimingFunction: 'var(--ease-expo-out)',
            }}
          >
            <span className="relative text-sm tracking-wider font-body">
              查看全部
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-black transition-all duration-300 group-hover:w-full" />
            </span>
            <ArrowRight
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
              strokeWidth={1.5}
            />
          </a>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {products.map((product, index) => {
            const row = Math.floor(index / 4);
            const col = index % 4;
            const delay = (row + col) * 80;

            return (
              <div
                key={product.id}
                onClick={() => navigate(`/product/${product.id}`)}
                className={`group relative cursor-pointer transition-all duration-500 ${isVisible
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-8 scale-95'
                  }`}
                style={{
                  transitionDelay: `${200 + delay}ms`,
                  transitionTimingFunction: 'var(--ease-spring)',
                }}
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-white">
                  <img
                    src={product.main_image_url || '/placeholder.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    style={{ transitionTimingFunction: 'var(--ease-expo-out)' }}
                  />

                  {/* Tag - 暂时只显示第一个标签 */}
                  {product.tags && product.tags.length > 0 && (
                    <span
                      className={`absolute top-3 left-3 px-3 py-1 text-xs text-white font-body ${isVisible ? 'animate-scale-in' : ''
                        }`}
                      style={{
                        backgroundColor: product.tags[0].color,
                        animationDelay: `${400 + delay}ms`,
                        animationTimingFunction: 'var(--ease-elastic)',
                      }}
                    >
                      {product.tags[0].name}
                    </span>
                  )}

                  {/* Quick Add Button */}
                  <div
                    onClick={(e) => handleAddToCart(e, product.id)}
                    className={`absolute bottom-0 left-0 right-0 p-3 bg-black text-white flex items-center justify-center gap-2 cursor-pointer
                      transition-all duration-300 ${hoveredProduct === product.id
                        ? 'translate-y-0 opacity-100'
                        : 'translate-y-full opacity-0'
                      }`}
                    style={{ transitionTimingFunction: 'var(--ease-expo-out)' }}
                  >
                    <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
                    <span className="text-sm font-body">加入购物车</span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="mt-4">
                  <h3 className="font-body text-sm sm:text-base text-black group-hover:text-gray-1 transition-colors duration-300">
                    {product.name}
                  </h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="font-display text-lg sm:text-xl text-black">
                      ¥{product.price.toLocaleString()}
                    </p>
                    {product.original_price && product.original_price > product.price && (
                      <p className="text-sm text-gray-400 line-through font-body">
                        ¥{product.original_price.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile View All Button */}
        <div className="flex sm:hidden justify-center mt-10">
          <a
            href="/search"
            className="inline-flex items-center gap-2 px-6 py-3 border border-black text-black"
          >
            <span className="text-sm tracking-wider font-body">查看全部</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </a>
        </div>
      </div>
    </section>
  );
}
