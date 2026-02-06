import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    isAdminRegistration: false,
    secretKey: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('请输入用户名');
      return false;
    }
    if (formData.username.length < 3) {
      setError('用户名至少3个字符');
      return false;
    }
    if (!formData.email.trim()) {
      setError('请输入邮箱');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('请输入有效的邮箱地址');
      return false;
    }
    if (!formData.password) {
      setError('请输入密码');
      return false;
    }
    if (formData.password.length < 6) {
      setError('密码至少6个字符');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return false;
    }
    if (!agreedToTerms) {
      setError('请同意用户协议');
      return false;
    }
    if (formData.isAdminRegistration && !formData.secretKey) {
      setError('请输入管理员密钥');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        secret_key: formData.isAdminRegistration ? formData.secretKey : undefined
      });
      navigate('/');
    } catch (err: any) {
      setError(err.message || '注册失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-2 flex items-center justify-center p-4">
      <div
        className={`w-full max-w-md transition-all duration-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        style={{ transitionTimingFunction: 'var(--ease-expo-out)' }}
      >
        {/* Logo */}
        <div className="text-center mb-12">
          <Link to="/" className="font-display text-4xl text-black">
            素居
          </Link>
          <p className="mt-2 text-gray-1 font-body">创建新账号</p>
        </div>

        {/* Form */}
        <div className="bg-white p-8">
          <h1 className="font-display text-2xl text-black mb-6">注册</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm font-body">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm text-gray-1 font-body mb-2">
                用户名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="请输入用户名（3-50字符）"
                className="w-full h-12 px-4 border border-gray-3 focus:border-black focus:outline-none font-body transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-gray-1 font-body mb-2">
                邮箱 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="请输入邮箱"
                className="w-full h-12 px-4 border border-gray-3 focus:border-black focus:outline-none font-body transition-colors"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm text-gray-1 font-body mb-2">
                手机号 <span className="text-gray-300">（可选）</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="请输入手机号"
                className="w-full h-12 px-4 border border-gray-3 focus:border-black focus:outline-none font-body transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-1 font-body mb-2">
                密码 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="请输入密码（至少6个字符）"
                  className="w-full h-12 px-4 pr-12 border border-gray-3 focus:border-black focus:outline-none font-body transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-1 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm text-gray-1 font-body mb-2">
                确认密码 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="请再次输入密码"
                  className="w-full h-12 px-4 pr-12 border border-gray-3 focus:border-black focus:outline-none font-body transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-1 hover:text-black transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Terms */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <div className="flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-4 h-4"
                  />
                </div>
                <span className="text-sm text-gray-1 font-body leading-relaxed">
                  同意
                  <Link to="/terms" className="text-black hover:underline mx-1">
                    用户协议
                  </Link>
                  和
                  <Link to="/privacy" className="text-black hover:underline ml-1">
                    隐私政策
                  </Link>
                </span>
              </label>

              {/* Admin Registration Toggle */}
              <div className="pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    const newState = !formData.isAdminRegistration;
                    setFormData({ ...formData, isAdminRegistration: newState, secretKey: '' });
                  }}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {formData.isAdminRegistration ? '取消管理员注册' : '注册为管理员'}
                </button>
              </div>

              {formData.isAdminRegistration && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-sm text-gray-1 font-body mb-2">
                    管理员密钥 <span className="text-xs text-gray-400">(开发环境: suju_admin_2026)</span>
                  </label>
                  <input
                    type="text"
                    name="secretKey"
                    value={formData.secretKey}
                    onChange={handleChange}
                    placeholder="请输入管理员密钥"
                    className="w-full h-12 px-4 border border-gray-3 focus:border-black focus:outline-none font-body transition-colors bg-gray-50"
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full h-12 flex items-center justify-center gap-2 font-body tracking-wider transition-all ${isLoading
                  ? 'bg-gray-400 text-white cursor-wait'
                  : 'bg-black text-white hover:bg-gray-800'
                  }`}
              >
                {isLoading ? '注册中...' : '注册'}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full h-12 flex items-center justify-center gap-2 font-body tracking-wider transition-all ${isLoading
                ? 'bg-gray-400 text-white cursor-wait'
                : 'bg-black text-white hover:bg-gray-800'
                }`}
            >
              {isLoading ? '注册中...' : '注册'}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-[1px] bg-gray-3" />
            <span className="text-sm text-gray-1 font-body">或</span>
            <div className="flex-1 h-[1px] bg-gray-3" />
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-3 gap-4">
            <button className="h-12 border border-gray-3 flex items-center justify-center hover:border-black transition-colors">
              <span className="text-xl">💬</span>
            </button>
            <button className="h-12 border border-gray-3 flex items-center justify-center hover:border-black transition-colors">
              <span className="text-xl">🔵</span>
            </button>
            <button className="h-12 border border-gray-3 flex items-center justify-center hover:border-black transition-colors">
              <span className="text-xl">🍎</span>
            </button>
          </div>
        </div>

        {/* Login Link */}
        <p className="text-center mt-6 text-gray-1 font-body">
          已有账号？
          <Link
            to="/login"
            className="text-black underline hover:no-underline ml-1"
          >
            立即登录
          </Link>
        </p>
      </div>
    </div>
  );
}
