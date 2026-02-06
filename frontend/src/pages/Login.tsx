import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts';
import { siteConfig } from '../config/theme';
import { content } from '../config/content';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!account.trim()) {
      setError('请输入用户名或邮箱');
      return;
    }
    if (!password) {
      setError('请输入密码');
      return;
    }

    setIsLoading(true);

    try {
      const response = await login({ account, password });

      if (response.user.is_admin) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || '登录失败，请重试');
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
            {siteConfig.name}
          </Link>
          <p className="mt-2 text-gray-1 font-body">{content.auth.login.welcome}</p>
        </div>

        {/* Form */}
        <div className="bg-white p-8">
          <h1 className="font-display text-2xl text-black mb-6">{content.auth.login.title}</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm font-body">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account */}
            <div>
              <label className="block text-sm text-gray-1 font-body mb-2">
                {content.auth.login.accountLabel}
              </label>
              <input
                type="text"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                placeholder={content.auth.login.accountPlaceholder}
                className="w-full h-12 px-4 border border-gray-3 focus:border-black focus:outline-none font-body transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-1 font-body mb-2">
                {content.auth.login.passwordLabel}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={content.auth.login.passwordPlaceholder}
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

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-1 font-body">{content.auth.login.rememberMe}</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-gray-1 hover:text-black font-body transition-colors"
              >
                {content.auth.login.forgotPassword}
              </Link>
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
              {isLoading ? content.auth.login.submitting : content.auth.login.submitButton}
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

        {/* Register Link */}
        <p className="text-center mt-6 text-gray-1 font-body">
          {content.auth.login.noAccount}
          <Link
            to="/register"
            className="text-black underline hover:no-underline ml-1"
          >
            {content.auth.login.registerLink}
          </Link>
        </p>
      </div>
    </div>
  );
}
