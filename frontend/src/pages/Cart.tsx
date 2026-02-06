import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ChevronRight,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { getCart, updateCartItem, removeFromCart } from '../services/cartService';
import type { CartItem } from '../services/cartService';
import { useAuth, useCart, useToast } from '../contexts';

export default function Cart() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { refreshCart } = useCart();
  const { showToast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadCart();
  }, [isAuthenticated]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const loadCart = async () => {
    try {
      const data = await getCart();
      setCartItems(data.items);
      // 默认全选
      const allIds = new Set(data.items.map(item => item.id));
      setSelectedIds(allIds);
    } catch (error) {
      console.error('加载购物车失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId: number, newQuantity: number, stock: number) => {
    if (newQuantity < 1 || newQuantity > stock) return;

    setUpdating(itemId);
    try {
      // 乐观更新
      setCartItems(items => items.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));

      await updateCartItem(itemId, newQuantity);
      refreshCart();
    } catch (error) {
      console.error('更新数量失败:', error);
      showToast('更新数量失败', 'error');
      // 回滚
      loadCart();
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (!confirm('确定要移出购物车吗？')) return;

    try {
      await removeFromCart(itemId);
      refreshCart();
      setCartItems(items => items.filter(item => item.id !== itemId));
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
      showToast('商品已移出购物车', 'success');
    } catch (error) {
      console.error('删除商品失败:', error);
      showToast('删除商品失败', 'error');
    }
  };

  const toggleSelect = (itemId: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === cartItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(cartItems.map(item => item.id)));
    }
  };

  const proceedToCheckout = () => {
    if (selectedIds.size === 0) {
      showToast('请选择要购买的商品', 'warning');
      return;
    }
    // 将选中的商品ID传递给结算页，或者后端支持基于选中的结算
    // 这里假设结算页会重新获取购物车中选中的商品，或者我们通过 state 传递
    navigate('/checkout', { state: { selectedIds: Array.from(selectedIds) } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white pt-20">
        <div className="w-full px-6 lg:px-12 py-16">
          <div className="max-w-7xl mx-auto text-center">
            <ShoppingBag className="w-20 h-20 mx-auto text-gray-3" strokeWidth={1} />
            <h2 className="mt-6 font-display text-2xl text-black">购物车是空的</h2>
            <p className="mt-2 text-gray-1 font-body">快去挑选心仪的商品吧</p>
            <button
              onClick={() => navigate('/')}
              className="mt-8 px-8 py-3 bg-black text-white font-body tracking-wider hover:bg-gray-800 transition-colors"
            >
              去购物
            </button>
          </div>
        </div>
      </div>
    );
  }

  const selectedItems = cartItems.filter(item => selectedIds.has(item.id));
  const selectedCount = selectedItems.length;
  const totalAmount = selectedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const isAllSelected = cartItems.length > 0 && selectedIds.size === cartItems.length;

  return (
    <div ref={sectionRef} className="min-h-screen bg-white pt-20">
      {/* Header */}
      <div className="w-full px-6 lg:px-12 py-8 border-b border-gray-3">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display text-3xl text-black">购物车</h1>
          <p className="mt-2 text-gray-1 font-body">共 {cartItems.length} 件商品</p>
        </div>
      </div>

      <div className="w-full px-6 lg:px-12 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              {/* Select All Header */}
              <div
                className={`flex items-center gap-4 p-4 bg-gray-2 mb-4 transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionTimingFunction: 'var(--ease-expo-out)' }}
              >
                <button
                  onClick={toggleSelectAll}
                  className={`w-5 h-5 border flex items-center justify-center transition-all ${isAllSelected ? 'bg-black border-black' : 'border-gray-3'
                    }`}
                >
                  {isAllSelected && <Check className="w-3 h-3 text-white" />}
                </button>
                <span className="font-body text-sm">全选</span>
                <span className="text-gray-1 font-body text-sm ml-auto">
                  已选 {selectedCount} 件
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex gap-4 p-4 border border-gray-3 transition-all duration-600 ${selectedIds.has(item.id) ? 'border-black' : ''
                      } ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                    style={{
                      transitionDelay: `${index * 80}ms`,
                      transitionTimingFunction: 'var(--ease-expo-out)'
                    }}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleSelect(item.id)}
                      className={`flex-shrink-0 w-5 h-5 border flex items-center justify-center transition-all mt-8 ${selectedIds.has(item.id) ? 'bg-black border-black' : 'border-gray-3'
                        }`}
                    >
                      {selectedIds.has(item.id) && <Check className="w-3 h-3 text-white" />}
                    </button>

                    {/* Product Image */}
                    <div
                      className="flex-shrink-0 w-24 h-24 bg-gray-2 cursor-pointer"
                      onClick={() => navigate(`/product/${item.product.id}`)}
                    >
                      <img
                        src={item.product.main_image_url || '/placeholder.jpg'}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-body text-base text-black cursor-pointer hover:text-gray-1 transition-colors"
                        onClick={() => navigate(`/product/${item.product.id}`)}
                      >
                        {item.product.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-1 font-body">库存: {item.product.stock}</p>
                      <p className="mt-2 font-display text-xl text-black">
                        ¥{item.product.price.toLocaleString()}
                      </p>

                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, item.product.stock)}
                            disabled={updating === item.id || item.quantity <= 1}
                            className="w-8 h-8 border border-gray-3 flex items-center justify-center hover:border-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-12 h-8 border-t border-b border-gray-3 flex items-center justify-center font-body text-sm relative">
                            {updating === item.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item.product.stock)}
                            disabled={updating === item.id || item.quantity >= item.product.stock}
                            className="w-8 h-8 border border-gray-3 flex items-center justify-center hover:border-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Subtotal */}
                        <span className="font-display text-lg text-black">
                          ¥{(item.product.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="flex-shrink-0 p-2 text-gray-1 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Continue Shopping */}
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 mt-8 text-gray-1 hover:text-black transition-colors font-body"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                继续购物
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div
                className={`sticky top-24 p-6 bg-gray-2 transition-all duration-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: '200ms', transitionTimingFunction: 'var(--ease-expo-out)' }}
              >
                <h2 className="font-display text-xl text-black mb-6">订单摘要</h2>

                {/* Summary Items */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm font-body">
                    <span className="text-gray-1">商品总额</span>
                    <span>¥{totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-body">
                    <span className="text-gray-1">运费</span>
                    <span className="text-green-600">免运费</span>
                  </div>
                  <div className="flex justify-between text-sm font-body">
                    <span className="text-gray-1">优惠</span>
                    <span>-¥0</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-[1px] bg-gray-3 mb-6" />

                {/* Total */}
                <div className="flex justify-between items-center mb-6">
                  <span className="font-body">应付总额</span>
                  <span className="font-display text-2xl text-black">¥{totalAmount.toLocaleString()}</span>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={proceedToCheckout}
                  disabled={selectedCount === 0}
                  className={`w-full h-14 flex items-center justify-center font-body tracking-wider transition-all ${selectedCount > 0
                    ? 'bg-black text-white hover:bg-gray-800'
                    : 'bg-gray-3 text-gray-1 cursor-not-allowed'
                    }`}
                >
                  去结算 ({selectedCount})
                </button>

                {/* Tips */}
                {selectedCount === 0 && (
                  <div className="flex items-center gap-2 mt-4 text-sm text-gray-1 font-body">
                    <AlertCircle className="w-4 h-4" />
                    <span>请选择要购买的商品</span>
                  </div>
                )}

                {/* Service Promise */}
                <div className="mt-6 pt-6 border-t border-gray-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-1 font-body">
                    <Check className="w-4 h-4" />
                    <span>正品保证</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-1 font-body">
                    <Check className="w-4 h-4" />
                    <span>7天无理由退换</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-1 font-body">
                    <Check className="w-4 h-4" />
                    <span>免费配送</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
