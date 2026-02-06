import { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, NavLink } from 'react-router-dom';
import {
  User,
  MapPin,
  ShoppingBag,
  Star,
  Heart,
  ChevronRight,
  Camera,
  Edit2,
  Check,
  Plus,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts';
import {
  getAddresses,
  createAddress,
  updateAddress as apiUpdateAddress,
  deleteAddress as apiDeleteAddress,
  setDefaultAddress as apiSetDefaultAddress,
} from '../services/addressService';
import type { Address, AddressRequest } from '../services/addressService';
import { getOrders } from '../services/orderService';
import type { OrderListItem } from '../services/orderService';
import { updateUser } from '../services/authService';
import type { UserUpdateRequest } from '../services/authService';
import Favorites from './profile/Favorites';
import Reviews from './profile/Reviews';

// 侧边栏菜单
const sidebarMenu = [
  { path: '/profile', label: '个人中心', icon: User },
  { path: '/profile/info', label: '个人信息', icon: Edit2 },
  { path: '/profile/addresses', label: '收货地址', icon: MapPin },
  { path: '/profile/orders', label: '我的订单', icon: ShoppingBag },
  { path: '/profile/reviews', label: '我的评价', icon: Star },
  { path: '/profile/favorites', label: '我的收藏', icon: Heart },
];

interface OrderStats {
  pending: number;
  paid: number;
  shipped: number;
  completed: number;
}

// 个人中心概览
function ProfileOverview() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState<OrderStats>({
    pending: 0,
    paid: 0,
    shipped: 0,
    completed: 0
  });

  useEffect(() => {
    setIsVisible(true);
    // 获取订单统计
    const fetchStats = async () => {
      try {
        const { list } = await getOrders({ page_size: 100 });
        const newStats = {
          pending: 0,
          paid: 0,
          shipped: 0,
          completed: 0
        };
        list.forEach(order => {
          if (order.status in newStats) {
            newStats[order.status as keyof OrderStats]++;
          }
        });
        setStats(newStats);
      } catch (error) {
        console.error('获取订单统计失败:', error);
      }
    };
    fetchStats();
  }, []);

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* User Card */}
      <div
        className={`bg-white p-6 transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ transitionTimingFunction: 'var(--ease-expo-out)' }}
      >
        <div className="flex items-center gap-6">
          <div className="relative">
            <img
              src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
              alt={user.username}
              className="w-20 h-20 rounded-full object-cover"
            />
          </div>
          <div>
            <h2 className="font-display text-2xl text-black">{user.username}</h2>
            <p className="text-gray-1 font-body mt-1">{user.email}</p>
            <p className="text-sm text-gray-1 font-body mt-1">加入时间: {new Date(user.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Order Stats */}
      <div
        className={`bg-white p-6 transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ transitionDelay: '100ms', transitionTimingFunction: 'var(--ease-expo-out)' }}
      >
        <h3 className="font-display text-xl text-black mb-4">我的订单</h3>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: '待付款', count: stats.pending, color: 'text-orange-500' },
            { label: '待发货', count: stats.paid, color: 'text-blue-500' },
            { label: '待收货', count: stats.shipped, color: 'text-purple-500' },
            { label: '已完成', count: stats.completed, color: 'text-green-500' },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-4 hover:bg-gray-50 transition-colors cursor-pointer">
              <div className={`font-display text-2xl ${stat.color}`}>{stat.count}</div>
              <div className="text-sm text-gray-1 font-body mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div
        className={`bg-white p-6 transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ transitionDelay: '200ms', transitionTimingFunction: 'var(--ease-expo-out)' }}
      >
        <h3 className="font-display text-xl text-black mb-4">快捷入口</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '收货地址', icon: MapPin, path: '/profile/addresses' },
            { label: '我的收藏', icon: Heart, path: '/profile/favorites' },
            { label: '我的评价', icon: Star, path: '/profile/reviews' },
          ].map((action) => (
            <NavLink
              key={action.label}
              to={action.path}
              className="flex flex-col items-center p-6 border border-gray-3 hover:border-black transition-colors group"
            >
              <action.icon className="w-6 h-6 text-gray-1 group-hover:text-black transition-colors" />
              <span className="mt-2 text-sm font-body text-gray-1 group-hover:text-black transition-colors">
                {action.label}
              </span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}

// 个人信息
function ProfileInfo() {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserUpdateRequest>({});
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    if (user) {
      setFormData({
        username: user.username,
        phone: user.phone || '',
        avatar_url: user.avatar_url || ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateUser(formData);
      await refreshUser();
      setIsEditing(false);
    } catch (error) {
      console.error('更新失败:', error);
      alert('更新失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div
      className={`bg-white p-6 transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      style={{ transitionTimingFunction: 'var(--ease-expo-out)' }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl text-black">个人信息</h2>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 border border-black text-sm font-body hover:bg-black hover:text-white transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            '保存中...'
          ) : (
            <>
              {isEditing ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
              {isEditing ? '保存' : '编辑'}
            </>
          )}
        </button>
      </div>

      <div className="space-y-6 max-w-lg">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <span className="w-24 text-sm text-gray-1 font-body">头像</span>
          <div className="relative">
            <img
              src={formData.avatar_url || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
              alt=""
              className="w-16 h-16 rounded-full object-cover"
            />
            {isEditing && (
              <button className="absolute bottom-0 right-0 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center">
                <Camera className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Username */}
        <div className="flex items-center gap-4">
          <span className="w-24 text-sm text-gray-1 font-body">用户名</span>
          {isEditing ? (
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="flex-1 h-12 px-4 border border-gray-3 focus:border-black focus:outline-none font-body"
            />
          ) : (
            <span className="flex-1 font-body">{user.username}</span>
          )}
        </div>

        {/* Email */}
        <div className="flex items-center gap-4">
          <span className="w-24 text-sm text-gray-1 font-body">邮箱</span>
          <span className="flex-1 font-body text-gray-500">{user.email}</span>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-4">
          <span className="w-24 text-sm text-gray-1 font-body">手机号</span>
          {isEditing ? (
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="flex-1 h-12 px-4 border border-gray-3 focus:border-black focus:outline-none font-body"
            />
          ) : (
            <span className="flex-1 font-body">{user.phone || '未设置'}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// 地址管理
function AddressManager() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchAddresses = async () => {
    try {
      const data = await getAddresses();
      setAddresses(data);
    } catch (error) {
      console.error('获取地址失败:', error);
    }
  };

  useEffect(() => {
    setIsVisible(true);
    fetchAddresses();
  }, []);

  const handleSetDefault = async (id: number) => {
    try {
      await apiSetDefaultAddress(id);
      fetchAddresses();
    } catch (error) {
      console.error('设置默认地址失败:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('确定要删除这个地址吗？')) {
      try {
        await apiDeleteAddress(id);
        fetchAddresses();
      } catch (error) {
        console.error('删除地址失败:', error);
      }
    }
  };

  const handleSaveAddress = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');

    const formData = new FormData(e.currentTarget);
    const data: AddressRequest = {
      recipient_name: formData.get('recipient_name') as string,
      phone: formData.get('phone') as string,
      province: formData.get('province') as string,
      city: formData.get('city') as string,
      district: formData.get('district') as string,
      detail_address: formData.get('detail_address') as string,
      is_default: formData.get('is_default') === 'on'
    };

    try {
      if (editingAddress) {
        await apiUpdateAddress(editingAddress.id, data);
      } else {
        await createAddress(data);
      }
      setShowForm(false);
      fetchAddresses();
    } catch (error: any) {
      setFormError(error.message || '保存失败');
    }
  };

  return (
    <div
      className={`transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      style={{ transitionTimingFunction: 'var(--ease-expo-out)' }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl text-black">收货地址</h2>
        <button
          onClick={() => { setEditingAddress(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-body hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新增地址
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-white p-12 text-center">
          <MapPin className="w-16 h-16 mx-auto text-gray-3" />
          <p className="mt-4 text-gray-1 font-body">暂无收货地址</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 px-6 py-2 border border-black text-sm font-body hover:bg-black hover:text-white transition-colors"
          >
            添加地址
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`bg-white p-6 border-2 transition-all ${address.is_default ? 'border-black' : 'border-transparent hover:border-gray-300'
                }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-body font-medium text-lg">{address.recipient_name}</span>
                    <span className="text-gray-1 font-body">{address.phone}</span>
                  </div>
                  <p className="mt-3 text-gray-1 font-body leading-relaxed">
                    {address.province} {address.city} {address.district}
                    <br />
                    {address.detail_address}
                  </p>
                  {address.is_default && (
                    <span className="inline-block mt-3 px-3 py-1 bg-black text-white text-xs font-body">
                      默认地址
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-3">
                {!address.is_default && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    className="text-sm text-gray-1 hover:text-black font-body transition-colors"
                  >
                    设为默认
                  </button>
                )}
                <button
                  onClick={() => { setEditingAddress(address); setShowForm(true); }}
                  className="text-sm text-gray-1 hover:text-black font-body transition-colors"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(address.id)}
                  className="text-sm text-gray-1 hover:text-red-500 font-body transition-colors"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-auto m-4">
            <form onSubmit={handleSaveAddress}>
              <div className="p-6 border-b border-gray-3 flex items-center justify-between">
                <h2 className="font-display text-xl text-black">
                  {editingAddress ? '编辑地址' : '新增地址'}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="p-2 hover:bg-gray-100 transition-colors"
                >
                  ✕
                </button>
              </div>

              {formError && (
                <div className="p-4 bg-red-50 text-red-500 text-sm mx-6 mt-4">
                  {formError}
                </div>
              )}

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-gray-1 font-body mb-2">收件人姓名</label>
                  <input
                    type="text"
                    name="recipient_name"
                    required
                    defaultValue={editingAddress?.recipient_name}
                    placeholder="请输入收件人姓名"
                    className="w-full h-12 px-4 border border-gray-3 focus:border-black focus:outline-none font-body"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-1 font-body mb-2">手机号码</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    defaultValue={editingAddress?.phone}
                    placeholder="请输入手机号码"
                    className="w-full h-12 px-4 border border-gray-3 focus:border-black focus:outline-none font-body"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-1 font-body mb-2">省份</label>
                    <input
                      type="text"
                      name="province"
                      required
                      defaultValue={editingAddress?.province}
                      placeholder="省份"
                      className="w-full h-12 px-4 border border-gray-3 focus:border-black focus:outline-none font-body"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-1 font-body mb-2">城市</label>
                    <input
                      type="text"
                      name="city"
                      required
                      defaultValue={editingAddress?.city}
                      placeholder="城市"
                      className="w-full h-12 px-4 border border-gray-3 focus:border-black focus:outline-none font-body"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-1 font-body mb-2">区县</label>
                    <input
                      type="text"
                      name="district"
                      required
                      defaultValue={editingAddress?.district}
                      placeholder="区县"
                      className="w-full h-12 px-4 border border-gray-3 focus:border-black focus:outline-none font-body"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-1 font-body mb-2">详细地址</label>
                  <textarea
                    name="detail_address"
                    required
                    defaultValue={editingAddress?.detail_address}
                    placeholder="请输入详细地址"
                    className="w-full h-24 p-4 border border-gray-3 resize-none focus:border-black focus:outline-none font-body text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_default"
                    id="default"
                    defaultChecked={editingAddress?.is_default}
                    className="w-4 h-4"
                  />
                  <label htmlFor="default" className="text-sm font-body">设为默认地址</label>
                </div>
              </div>
              <div className="p-6 border-t border-gray-3 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 h-12 border border-gray-3 font-body hover:border-black transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 h-12 bg-black text-white font-body hover:bg-gray-800 transition-colors"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// 我的订单
function MyOrders() {
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const { list } = await getOrders({
          status: activeTab === 'all' ? undefined : activeTab
        });
        setOrders(list);
      } catch (error) {
        console.error('获取订单失败:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [activeTab]);

  const tabs = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待付款' },
    { key: 'paid', label: '待发货' },
    { key: 'shipped', label: '待收货' },
    { key: 'completed', label: '已完成' },
  ];

  return (
    <div
      className={`transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      style={{ transitionTimingFunction: 'var(--ease-expo-out)' }}
    >
      <h2 className="font-display text-xl text-black mb-6">我的订单</h2>

      {/* Tabs */}
      <div className="flex border-b border-gray-3 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-3 font-body text-sm transition-all relative whitespace-nowrap ${activeTab === tab.key ? 'text-black' : 'text-gray-1 hover:text-black'
              }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-black" />
            )}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-12 text-center text-gray-500">加载中...</div>
      )}

      {/* Empty State */}
      {!loading && orders.length === 0 && (
        <div className="bg-white p-12 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-3" />
          <p className="mt-4 text-gray-1 font-body">暂无订单</p>
          <NavLink to="/search" className="inline-block mt-4 px-6 py-2 border border-black text-sm font-body hover:bg-black hover:text-white transition-colors">
            去购物
          </NavLink>
        </div>
      )}

      {/* Order List */}
      {!loading && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white border border-gray-2 p-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-2">
                <span className="text-sm text-gray-500">订单号: {order.order_number}</span>
                <span className="text-sm text-black font-medium">{order.status_text}</span>
              </div>
              {order.items.map(item => (
                <div key={item.id} className="flex gap-4 py-2">
                  <div className="w-16 h-16 bg-gray-100">
                    {item.product_image && <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-body text-sm truncate">{item.product_name}</h4>
                    <p className="text-xs text-gray-500 mt-1">x {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-body text-sm">¥{item.unit_price}</p>
                  </div>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between items-center">
                <span className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</span>
                <div className="text-right">
                  <p className="text-sm">实付: <span className="text-lg font-bold">¥{order.total_amount}</span></p>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <NavLink to={`/order/${order.id}`} className="px-4 py-1 text-sm border border-gray-300 hover:border-black transition-colors">
                  查看详情
                </NavLink>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 主组件
export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading || !user) {
    return <div className="min-h-screen bg-gray-2 pt-20 flex justify-center items-center">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-2 pt-20">
      <div className="w-full px-6 lg:px-12 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white">
                {/* Mobile Toggle */}
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="lg:hidden w-full p-4 flex items-center justify-between border-b border-gray-3"
                >
                  <span className="font-body">菜单</span>
                  <ChevronRight className={`w-5 h-5 transition-transform ${isSidebarOpen ? 'rotate-90' : ''}`} />
                </button>

                {/* Menu Items */}
                <nav className={`${isSidebarOpen ? 'block' : 'hidden'} lg:block`}>
                  {sidebarMenu.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/profile'}
                      onClick={() => setIsSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-6 py-4 border-b border-gray-3 transition-all ${isActive
                          ? 'bg-black text-white'
                          : 'text-gray-1 hover:bg-gray-50 hover:text-black'
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-body">{item.label}</span>
                    </NavLink>
                  ))}
                  <button
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-3 px-6 py-4 text-gray-1 hover:text-red-500 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-body">退出登录</span>
                  </button>
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <Routes>
                <Route index element={<ProfileOverview />} />
                <Route path="info" element={<ProfileInfo />} />
                <Route path="addresses" element={<AddressManager />} />
                <Route path="orders" element={<MyOrders />} />
                <Route path="reviews" element={<Reviews />} />
                <Route path="favorites" element={<Favorites />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
