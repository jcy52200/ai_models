import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Search as SearchIcon,
    SlidersHorizontal,
    X,
    ChevronDown,
    ShoppingBag,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { getProducts, getCategories } from '../services/productService';
import type { ProductListItem, Category } from '../services/productService';
import { addToCart } from '../services/cartService';
import { useAuth, useCart, useToast } from '../contexts';

// 排序选项
const sortOptions = [
    { value: 'popular', label: '综合排序' },
    { value: 'newest', label: '最新上架' },
    { value: 'sales', label: '销量优先' },
    { value: 'price_asc', label: '价格从低到高' },
    { value: 'price_desc', label: '价格从高到低' },
];

// 价格区间
const priceRanges = [
    { min: 0, max: 500, label: '¥500以下' },
    { min: 500, max: 1000, label: '¥500-1000' },
    { min: 1000, max: 2000, label: '¥1000-2000' },
    { min: 2000, max: undefined, label: '¥2000以上' },
];

export default function Search() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { refreshCart } = useCart();
    const { showToast } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
    const sectionRef = useRef<HTMLDivElement>(null);

    // 数据状态
    const [products, setProducts] = useState<ProductListItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [total, setTotal] = useState(0);

    // 搜索状态从 URL 参数初始化
    const [keyword, setKeyword] = useState(searchParams.get('q') || '');
    const [selectedCategory, setSelectedCategory] = useState<number | null>(
        searchParams.get('category') ? Number(searchParams.get('category')) : null
    );
    const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'popular');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    // 初始化加载
    useEffect(() => {
        setIsLoaded(true);
        loadCategories();
    }, []);

    // 监听筛选条件变化，重新获取商品
    useEffect(() => {
        loadProducts();
    }, [keyword, selectedCategory, selectedPriceRange, sortBy, currentPage]);

    const loadCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (error) {
            console.error('获取分类失败:', error);
        }
    };

    const loadProducts = async () => {
        setIsLoading(true);
        try {
            const priceRange = selectedPriceRange !== null ? priceRanges[selectedPriceRange] : null;

            const { list, pagination } = await getProducts({
                page: currentPage,
                page_size: itemsPerPage,
                keyword: keyword || undefined,
                category_id: selectedCategory || undefined,
                sort_by: sortBy === 'popular' ? undefined : (sortBy as any),
                min_price: priceRange?.min,
                max_price: priceRange?.max,
                is_published: true,
            });

            setProducts(list);
            setTotal(pagination.total);
        } catch (error) {
            console.error('获取商品列表失败:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        updateUrlParams();
    };

    const updateUrlParams = () => {
        const params: Record<string, string> = {};
        if (keyword) params.q = keyword;
        if (selectedCategory) params.category = selectedCategory.toString();
        if (sortBy !== 'popular') params.sort = sortBy;
        setSearchParams(params);
    };

    // 当筛选条件改变时，同步到URL并重置页码
    const handleCategoryChange = (id: number | null) => {
        setSelectedCategory(id);
        setCurrentPage(1);
        const params: Record<string, string> = {};
        if (keyword) params.q = keyword;
        if (id) params.category = id.toString();
        if (sortBy !== 'popular') params.sort = sortBy;
        setSearchParams(params);
    };

    const handleSortChange = (value: string) => {
        setSortBy(value);
        setCurrentPage(1);
        const params = Object.fromEntries(searchParams);
        if (value !== 'popular') params.sort = value;
        else delete params.sort;
        setSearchParams(params);
    };

    const clearFilters = () => {
        setKeyword('');
        setSelectedCategory(null);
        setSelectedPriceRange(null);
        setSortBy('popular');
        setCurrentPage(1);
        setSearchParams({});
    };

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

    const totalPages = Math.ceil(total / itemsPerPage);
    const hasActiveFilters = keyword || selectedCategory !== null || selectedPriceRange !== null;

    return (
        <div ref={sectionRef} className="min-h-screen bg-white pt-24 pb-16">
            <div className="w-full px-6 lg:px-12">
                {/* 页面标题 */}
                <div
                    className={`mb-8 transition-all duration-800 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                        }`}
                    style={{ transitionTimingFunction: 'var(--ease-expo-out)' }}
                >
                    <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl text-black">
                        商城
                    </h1>
                    <p className="mt-3 text-gray-1 text-base font-body">
                        发现我们精心挑选的家具系列
                    </p>
                </div>

                {/* 搜索栏 */}
                <div
                    className={`mb-8 transition-all duration-800 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                        }`}
                    style={{
                        transitionDelay: '100ms',
                        transitionTimingFunction: 'var(--ease-expo-out)',
                    }}
                >
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="relative flex-1 max-w-xl">
                            <SearchIcon
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-5"
                                strokeWidth={1.5}
                            />
                            <input
                                type="text"
                                placeholder="搜索家具..."
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                className="w-full h-12 pl-12 pr-4 border border-gray-3 text-sm font-body focus:border-black focus:outline-none transition-colors duration-200"
                            />
                            {keyword && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setKeyword('');
                                        setCurrentPage(1);
                                        const params = Object.fromEntries(searchParams);
                                        delete params.q;
                                        setSearchParams(params);
                                    }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-2 rounded-full transition-colors"
                                >
                                    <X className="w-4 h-4 text-gray-5" strokeWidth={1.5} />
                                </button>
                            )}
                        </div>
                        <button
                            type="submit"
                            className="h-12 px-6 bg-black text-white text-sm font-body tracking-wider hover:bg-gray-4 transition-colors duration-300"
                        >
                            搜索
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowFilters(!showFilters)}
                            className={`h-12 px-4 border border-gray-3 text-sm font-body flex items-center gap-2 transition-all duration-300 lg:hidden ${showFilters ? 'bg-black text-white border-black' : 'hover:border-black'
                                }`}
                        >
                            <SlidersHorizontal className="w-4 h-4" strokeWidth={1.5} />
                            筛选
                        </button>
                    </form>
                </div>

                <div className="flex gap-8">
                    {/* 左侧筛选栏 */}
                    <aside
                        className={`hidden lg:block w-64 shrink-0 transition-all duration-800 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                            }`}
                        style={{
                            transitionDelay: '200ms',
                            transitionTimingFunction: 'var(--ease-expo-out)',
                        }}
                    >
                        <div className="sticky top-28 space-y-8">
                            {/* 分类筛选 */}
                            <div>
                                <h3 className="font-display text-lg text-black mb-4">分类</h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => handleCategoryChange(null)}
                                        className={`w-full flex items-center justify-between py-2 px-3 text-sm font-body transition-all duration-200 ${selectedCategory === null
                                            ? 'bg-black text-white'
                                            : 'hover:bg-gray-2 text-black'
                                            }`}
                                    >
                                        <span>全部</span>
                                    </button>
                                    {categories.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => handleCategoryChange(selectedCategory === category.id ? null : category.id)}
                                            className={`w-full flex items-center justify-between py-2 px-3 text-sm font-body transition-all duration-200 ${selectedCategory === category.id
                                                ? 'bg-black text-white'
                                                : 'hover:bg-gray-2 text-black'
                                                }`}
                                        >
                                            <span>{category.name}</span>
                                            {/* <span className={selectedCategory === category.id ? 'text-white/70' : 'text-gray-5'}>
                                                ({category.count})
                                            </span> */}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 价格区间 */}
                            <div>
                                <h3 className="font-display text-lg text-black mb-4">价格</h3>
                                <div className="space-y-2">
                                    {priceRanges.map((range, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                setSelectedPriceRange(selectedPriceRange === index ? null : index);
                                                setCurrentPage(1);
                                            }}
                                            className={`w-full py-2 px-3 text-sm font-body text-left transition-all duration-200 ${selectedPriceRange === index
                                                ? 'bg-black text-white'
                                                : 'hover:bg-gray-2 text-black'
                                                }`}
                                        >
                                            {range.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 清除筛选 */}
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="w-full py-3 border border-gray-3 text-sm font-body text-black hover:border-black transition-colors duration-200"
                                >
                                    清除筛选
                                </button>
                            )}
                        </div>
                    </aside>

                    {/* 移动端筛选弹窗 */}
                    {showFilters && (
                        <div
                            className="fixed inset-0 z-50 bg-white lg:hidden overflow-y-auto"
                            style={{ top: 0 }}
                        >
                            <div className="px-6 py-4 border-b border-gray-3 flex items-center justify-between sticky top-0 bg-white">
                                <h2 className="font-display text-xl">筛选</h2>
                                <button onClick={() => setShowFilters(false)}>
                                    <X className="w-6 h-6" strokeWidth={1.5} />
                                </button>
                            </div>
                            <div className="p-6 space-y-8">
                                {/* 分类 */}
                                <div>
                                    <h3 className="font-display text-lg text-black mb-4">分类</h3>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => handleCategoryChange(null)}
                                            className={`w-full flex items-center justify-between py-3 px-4 text-sm font-body transition-all duration-200 ${selectedCategory === null
                                                ? 'bg-black text-white'
                                                : 'border border-gray-3 text-black'
                                                }`}
                                        >
                                            <span>全部</span>
                                        </button>
                                        {categories.map((category) => (
                                            <button
                                                key={category.id}
                                                onClick={() => handleCategoryChange(selectedCategory === category.id ? null : category.id)}
                                                className={`w-full flex items-center justify-between py-3 px-4 text-sm font-body transition-all duration-200 ${selectedCategory === category.id
                                                    ? 'bg-black text-white'
                                                    : 'border border-gray-3 text-black'
                                                    }`}
                                            >
                                                <span>{category.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 价格 */}
                                <div>
                                    <h3 className="font-display text-lg text-black mb-4">价格</h3>
                                    <div className="space-y-2">
                                        {priceRanges.map((range, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedPriceRange(selectedPriceRange === index ? null : index)}
                                                className={`w-full py-3 px-4 text-sm font-body text-left transition-all duration-200 ${selectedPriceRange === index
                                                    ? 'bg-black text-white'
                                                    : 'border border-gray-3 text-black'
                                                    }`}
                                            >
                                                {range.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-gray-3 sticky bottom-0 bg-white flex gap-4">
                                <button
                                    onClick={() => {
                                        clearFilters();
                                        setShowFilters(false);
                                    }}
                                    className="flex-1 py-3 border border-gray-3 text-sm font-body"
                                >
                                    清除
                                </button>
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="flex-1 py-3 bg-black text-white text-sm font-body"
                                >
                                    应用
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 商品列表区 */}
                    <div className="flex-1">
                        {/* 排序和结果统计 */}
                        <div
                            className={`flex items-center justify-between mb-6 transition-all duration-800 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                                }`}
                            style={{
                                transitionDelay: '200ms',
                                transitionTimingFunction: 'var(--ease-expo-out)',
                            }}
                        >
                            <p className="text-sm text-gray-1 font-body">
                                共 <span className="text-black">{total}</span> 件商品
                            </p>
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                    className="appearance-none h-10 pl-4 pr-10 border border-gray-3 text-sm font-body focus:border-black focus:outline-none cursor-pointer"
                                >
                                    {sortOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-5 pointer-events-none"
                                    strokeWidth={1.5}
                                />
                            </div>
                        </div>

                        {/* Loading State */}
                        {isLoading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                            </div>
                        ) : (
                            <>
                                {/* 商品网格 */}
                                {products.length > 0 ? (
                                    <>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                                            {products.map((product, index) => (
                                                <div
                                                    key={product.id}
                                                    onClick={() => navigate(`/product/${product.id}`)}
                                                    className={`group relative cursor-pointer transition-all duration-500 opacity-100 translate-y-0 scale-100`}
                                                    style={{
                                                        transitionDelay: `${index * 50}ms`,
                                                        transitionTimingFunction: 'var(--ease-spring)',
                                                    }}
                                                    onMouseEnter={() => setHoveredProduct(product.id)}
                                                    onMouseLeave={() => setHoveredProduct(null)}
                                                >
                                                    {/* 图片容器 */}
                                                    <div className="relative aspect-square overflow-hidden bg-gray-2">
                                                        <img
                                                            src={product.main_image_url || '/placeholder.jpg'}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                            style={{ transitionTimingFunction: 'var(--ease-expo-out)' }}
                                                        />

                                                        {/* 标签 */}
                                                        {product.tags && product.tags.length > 0 && (
                                                            <span
                                                                className={`absolute top-3 left-3 px-3 py-1 text-xs text-white font-body`}
                                                                style={{ backgroundColor: product.tags[0].color }}
                                                            >
                                                                {product.tags[0].name}
                                                            </span>
                                                        )}

                                                        {/* 快速添加按钮 */}
                                                        <div
                                                            className={`absolute bottom-0 left-0 right-0 p-3 bg-black text-white flex items-center justify-center gap-2 cursor-pointer
                                    transition-all duration-300 ${hoveredProduct === product.id
                                                                    ? 'translate-y-0 opacity-100'
                                                                    : 'translate-y-full opacity-0'
                                                                }`}
                                                            style={{ transitionTimingFunction: 'var(--ease-expo-out)' }}
                                                            onClick={(e) => handleAddToCart(e, product.id)}
                                                        >
                                                            <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
                                                            <span className="text-sm font-body">加入购物车</span>
                                                        </div>
                                                    </div>

                                                    {/* 商品信息 */}
                                                    <div className="mt-4">
                                                        <h3 className="font-body text-sm sm:text-base text-black group-hover:text-gray-1 transition-colors duration-300">
                                                            {product.name}
                                                        </h3>
                                                        <div className="mt-1 flex items-baseline gap-2">
                                                            <span className="font-display text-lg sm:text-xl text-black">
                                                                ¥{product.price.toLocaleString()}
                                                            </span>
                                                            {product.original_price && product.original_price > product.price && (
                                                                <span className="text-sm text-gray-5 line-through">
                                                                    ¥{product.original_price.toLocaleString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* 分页 */}
                                        {totalPages > 1 && (
                                            <div
                                                className={`flex items-center justify-center gap-2 mt-12 transition-all duration-800 opacity-100 translate-y-0`}
                                            >
                                                <button
                                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                                    disabled={currentPage === 1}
                                                    className={`p-2 border border-gray-3 transition-all duration-200 ${currentPage === 1
                                                        ? 'opacity-30 cursor-not-allowed'
                                                        : 'hover:border-black hover:bg-black hover:text-white'
                                                        }`}
                                                >
                                                    <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
                                                </button>

                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                    <button
                                                        key={page}
                                                        onClick={() => setCurrentPage(page)}
                                                        className={`w-10 h-10 text-sm font-body transition-all duration-200 ${currentPage === page
                                                            ? 'bg-black text-white'
                                                            : 'border border-gray-3 hover:border-black'
                                                            }`}
                                                    >
                                                        {page}
                                                    </button>
                                                ))}

                                                <button
                                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                                    disabled={currentPage === totalPages}
                                                    className={`p-2 border border-gray-3 transition-all duration-200 ${currentPage === totalPages
                                                        ? 'opacity-30 cursor-not-allowed'
                                                        : 'hover:border-black hover:bg-black hover:text-white'
                                                        }`}
                                                >
                                                    <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    /* 无结果状态 */
                                    <div
                                        className={`flex flex-col items-center justify-center py-24 transition-all duration-800 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                                            }`}
                                        style={{
                                            transitionDelay: '300ms',
                                            transitionTimingFunction: 'var(--ease-expo-out)',
                                        }}
                                    >
                                        <SearchIcon className="w-16 h-16 text-gray-3 mb-4" strokeWidth={1} />
                                        <p className="text-lg text-gray-1 font-body">未找到相关商品</p>
                                        <p className="text-sm text-gray-5 font-body mt-2">
                                            请尝试其他关键词或筛选条件
                                        </p>
                                        <button
                                            onClick={clearFilters}
                                            className="mt-6 px-6 py-3 border border-black text-sm font-body hover:bg-black hover:text-white transition-all duration-300"
                                        >
                                            清除筛选
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
