import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  MapPin,
  Plus,
  Check,
  CreditCard,
  Truck,
  Shield,
  Edit2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { getAddresses, createAddress } from '../services/addressService';
import type { Address, AddressRequest } from '../services/addressService';
import { getCart } from '../services/cartService';
import type { CartItem } from '../services/cartService';
import { createOrder } from '../services/orderService';
import { useAuth } from '../contexts';

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'alipay' | 'wechat' | 'unionpay'>('alipay');
  const [note, setNote] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // 新地址表单状态
  const [newAddress, setNewAddress] = useState<AddressRequest>({
    recipient_name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail_address: '',
    is_default: false
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadData();
  }, [isAuthenticated]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const loadData = async () => {
    try {
      const [addressList, cartData] = await Promise.all([
        getAddresses(),
        getCart()
      ]);

      setAddresses(addressList);

      // 设置默认选中地址
      const defaultAddress = addressList.find(a => a.is_default);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else if (addressList.length > 0) {
        setSelectedAddressId(addressList[0].id);
      }

      // 过滤选中的购物车商品
      const selectedIds = location.state?.selectedIds;
      if (selectedIds && Array.isArray(selectedIds)) {
        const items = cartData.items.filter(item => selectedIds.includes(item.id));
        setCartItems(items);
        if (items.length === 0) {
          alert('未选择任何商品');
          navigate('/cart');
        }
      } else {
        // 如果没有传入选中ID，默认全选？或者跳转回购物车
        // 这里为了体验，如果没有传参则跳转回购物车
        navigate('/cart');
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      alert('加载数据失败，请重试');
    } finally {
      setLoading(false);
    }
  };



  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingFee = 0; // 免运费
  const discount = 0;
  const totalAmount = subtotal + shippingFee - discount;

  const handleCreateAddress = async () => {
    if (!newAddress.recipient_name || !newAddress.phone || !newAddress.detail_address) {
      alert('请填写完整地址信息');
      return;
    }

    try {
      const address = await createAddress(newAddress);
      setAddresses([...addresses, address]);
      setSelectedAddressId(address.id);
      setShowAddressForm(false);
      // 重置表单
      setNewAddress({
        recipient_name: '',
        phone: '',
        province: '',
        city: '',
        district: '',
        detail_address: '',
        is_default: false
      });
    } catch (error) {
      console.error('创建地址失败:', error);
      alert('创建地址失败，请重试');
    }
  };

  const submitOrder = async () => {
    if (!selectedAddressId) {
      alert('请选择收货地址');
      return;
    }

    if (cartItems.length === 0) {
      alert('商品清单为空');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createOrder({
        cart_item_ids: cartItems.map(item => item.id),
        address_id: selectedAddressId,
        payment_method: paymentMethod,
        note: note || undefined
      });

      const orderId = response.order.id;
      // 这里可以跳转到订单详情或支付页
      // 如果后端只要跳转到订单详情，模拟支付
      navigate(`/order/${orderId}`);
    } catch (error) {
      console.error('创建订单失败:', error);
      alert('创建订单失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentMethods = [
    { id: 'alipay', name: '支付宝', icon: '💳' },
    { id: 'wechat', name: '微信支付', icon: '💬' },
    { id: 'unionpay', name: '银联支付', icon: '🏦' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div ref={sectionRef} className="min-h-screen bg-gray-2 pt-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-3">
        <div className="w-full px-6 lg:px-12 py-4">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            <button
              onClick={() => navigate('/cart')}
              className="p-2 hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="font-display text-2xl text-black">确认订单</h1>
          </div>
        </div>
      </div>

      <div className="w-full px-6 lg:px-12 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Address Section */}
              <div
                className={`bg-white p-6 transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionTimingFunction: 'var(--ease-expo-out)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-xl text-black flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    收货地址
                  </h2>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="flex items-center gap-1 text-sm text-gray-1 hover:text-black transition-colors font-body"
                  >
                    <Plus className="w-4 h-4" />
                    新增地址
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 mx-auto text-gray-3" />
                    <p className="mt-4 text-gray-1 font-body">暂无收货地址</p>
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="mt-4 px-6 py-2 border border-black text-sm font-body hover:bg-black hover:text-white transition-colors"
                    >
                      添加地址
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        onClick={() => setSelectedAddressId(address.id)}
                        className={`p-4 border cursor-pointer transition-all ${selectedAddressId === address.id
                          ? 'border-black border-2'
                          : 'border-gray-3 hover:border-gray-400'
                          }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <span className="font-body font-medium">{address.recipient_name}</span>
                              <span className="text-gray-1 font-body">{address.phone}</span>
                              {address.is_default && (
                                <span className="px-2 py-0.5 bg-black text-white text-xs font-body">
                                  默认
                                </span>
                              )}
                            </div>
                            <p className="mt-2 text-gray-1 font-body text-sm">
                              {address.province} {address.city} {address.district}
                              <br />
                              {address.detail_address}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {selectedAddressId === address.id && (
                              <Check className="w-5 h-5 text-black" />
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // 编辑逻辑暂未实现
                              }}
                              className="p-2 text-gray-1 hover:text-black transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Products Section */}
              <div
                className={`bg-white p-6 transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: '100ms', transitionTimingFunction: 'var(--ease-expo-out)' }}
              >
                <h2 className="font-display text-xl text-black mb-4">商品清单</h2>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 py-4 border-b border-gray-3 last:border-0">
                      <div className="w-20 h-20 bg-gray-2 flex-shrink-0">
                        <img
                          src={item.product.main_image_url || '/placeholder.jpg'}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-body text-base text-black">{item.product.name}</h3>
                        <p className="text-sm text-gray-1 font-body mt-1">数量: {item.quantity}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-display text-lg text-black">
                            ¥{item.product.price.toLocaleString()}
                          </span>
                          <span className="text-gray-1 font-body text-sm">×{item.quantity}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div
                className={`bg-white p-6 transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: '200ms', transitionTimingFunction: 'var(--ease-expo-out)' }}
              >
                <h2 className="font-display text-xl text-black mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  支付方式
                </h2>
                <div className="grid grid-cols-3 gap-4">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as typeof paymentMethod)}
                      className={`p-4 border text-center transition-all ${paymentMethod === method.id
                        ? 'border-black border-2'
                        : 'border-gray-3 hover:border-gray-400'
                        }`}
                    >
                      <div className="text-2xl mb-2">{method.icon}</div>
                      <span className="font-body text-sm">{method.name}</span>
                      {paymentMethod === method.id && (
                        <div className="mt-2">
                          <Check className="w-4 h-4 mx-auto text-black" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div
                className={`bg-white p-6 transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: '300ms', transitionTimingFunction: 'var(--ease-expo-out)' }}
              >
                <h2 className="font-display text-xl text-black mb-4">订单备注</h2>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="请输入订单备注（选填）"
                  className="w-full h-24 p-4 border border-gray-3 resize-none focus:border-black focus:outline-none font-body text-sm"
                />
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div
                className={`sticky top-24 bg-white p-6 transition-all duration-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: '200ms', transitionTimingFunction: 'var(--ease-expo-out)' }}
              >
                <h2 className="font-display text-xl text-black mb-6">订单金额</h2>

                {/* Amount Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm font-body">
                    <span className="text-gray-1">商品总额</span>
                    <span>¥{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-body">
                    <span className="text-gray-1">运费</span>
                    <span className="text-green-600">免运费</span>
                  </div>
                  <div className="flex justify-between text-sm font-body">
                    <span className="text-gray-1">优惠</span>
                    <span>-¥{discount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-[1px] bg-gray-3 mb-6" />

                {/* Total */}
                <div className="flex justify-between items-center mb-6">
                  <span className="font-body">应付总额</span>
                  <span className="font-display text-3xl text-black">¥{totalAmount.toLocaleString()}</span>
                </div>

                {/* Submit Button */}
                <button
                  onClick={submitOrder}
                  disabled={isSubmitting || !selectedAddressId}
                  className={`w-full h-14 flex items-center justify-center font-body tracking-wider transition-all ${isSubmitting
                    ? 'bg-gray-400 text-white cursor-wait'
                    : selectedAddressId
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'bg-gray-3 text-gray-1 cursor-not-allowed'
                    }`}
                >
                  {isSubmitting ? '提交中...' : '提交订单'}
                </button>

                {!selectedAddressId && (
                  <div className="flex items-center gap-2 mt-4 text-sm text-red-500 font-body">
                    <AlertCircle className="w-4 h-4" />
                    <span>请选择收货地址</span>
                  </div>
                )}

                {/* Service Promise */}
                <div className="mt-6 pt-6 border-t border-gray-3 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-1 font-body">
                    <Shield className="w-4 h-4" />
                    <span>安全支付保障</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-1 font-body">
                    <Truck className="w-4 h-4" />
                    <span>免费配送上门</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address Form Modal */}
      {showAddressForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-auto m-4">
            <div className="p-6 border-b border-gray-3 flex items-center justify-between">
              <h2 className="font-display text-xl text-black">新增收货地址</h2>
              <button
                onClick={() => setShowAddressForm(false)}
                className="p-2 hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-1 font-body mb-2">收件人姓名</label>
                <input
                  type="text"
                  value={newAddress.recipient_name}
                  onChange={(e) => setNewAddress({ ...newAddress, recipient_name: e.target.value })}
                  placeholder="请输入收件人姓名"
                  className="w-full h-12 px-4 border border-gray-3 focus:border-black focus:outline-none font-body"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-1 font-body mb-2">手机号码</label>
                <input
                  type="tel"
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                  placeholder="请输入手机号码"
                  className="w-full h-12 px-4 border border-gray-3 focus:border-black focus:outline-none font-body"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-1 font-body mb-2">省份</label>
                  <input
                    type="text"
                    value={newAddress.province}
                    onChange={(e) => setNewAddress({ ...newAddress, province: e.target.value })}
                    className="w-full h-12 px-4 border border-gray-3 focus:border-black focus:outline-none font-body"
                    placeholder="省份"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-1 font-body mb-2">城市</label>
                  <input
                    type="text"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full h-12 px-4 border border-gray-3 focus:border-black focus:outline-none font-body"
                    placeholder="城市"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-1 font-body mb-2">区县</label>
                  <input
                    type="text"
                    value={newAddress.district}
                    onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                    className="w-full h-12 px-4 border border-gray-3 focus:border-black focus:outline-none font-body"
                    placeholder="区县"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-1 font-body mb-2">详细地址</label>
                <textarea
                  value={newAddress.detail_address}
                  onChange={(e) => setNewAddress({ ...newAddress, detail_address: e.target.value })}
                  placeholder="请输入详细地址"
                  className="w-full h-24 p-4 border border-gray-3 resize-none focus:border-black focus:outline-none font-body text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="default"
                  className="w-4 h-4"
                  checked={newAddress.is_default}
                  onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })}
                />
                <label htmlFor="default" className="text-sm font-body">设为默认地址</label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-3 flex gap-4">
              <button
                onClick={() => setShowAddressForm(false)}
                className="flex-1 h-12 border border-gray-3 font-body hover:border-black transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateAddress}
                className="flex-1 h-12 bg-black text-white font-body hover:bg-gray-800 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
