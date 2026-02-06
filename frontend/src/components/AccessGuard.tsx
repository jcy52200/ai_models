import { useState, useEffect, useCallback } from 'react';
import { Lock, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';

/**
 * 访问密钥配置
 * 从环境变量读取，若未配置则允许直接访问（开发环境便利）
 */
const ACCESS_KEY = import.meta.env.VITE_ACCESS_KEY || '';

/**
 * localStorage 存储键名
 */
const STORAGE_KEY = 'suju_access_verified';

/**
 * AccessGuard 组件
 *
 * 功能说明：
 * - 在应用加载前显示访问密钥验证界面
 * - 验证通过后存储状态到 localStorage，刷新页面无需重新输入
 * - 支持密码可见/隐藏切换
 * - 优雅的加载动画和过渡效果
 * - 若环境变量未配置密钥，则自动跳过验证
 *
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 验证通过后渲染的子组件
 * @returns {JSX.Element} 访问验证界面或子组件
 */
export default function AccessGuard({ children }: { children: React.ReactNode }) {
  // ===== 状态管理 =====

  /**
   * 是否已验证通过
   * @type {boolean}
   */
  const [isVerified, setIsVerified] = useState(false);

  /**
   * 是否正在加载（检查 localStorage 状态）
   * @type {boolean}
   */
  const [isLoading, setIsLoading] = useState(true);

  /**
   * 用户输入的密钥
   * @type {string}
   */
  const [inputKey, setInputKey] = useState('');

  /**
   * 是否显示密码（明文/密文切换）
   * @type {boolean}
   */
  const [showPassword, setShowPassword] = useState(false);

  /**
   * 错误提示信息
   * @type {string}
   */
  const [error, setError] = useState('');

  /**
   * 是否正在验证中（按钮加载状态）
   * @type {boolean}
   */
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * 组件挂载动画
   * @type {boolean}
   */
  const [isMounted, setIsMounted] = useState(false);

  // ===== 生命周期 =====

  /**
   * 组件挂载时检查验证状态
   * - 若环境变量未配置密钥，直接通过
   * - 若 localStorage 已标记验证通过，直接通过
   */
  useEffect(() => {
    // 延迟挂载动画
    const mountTimer = setTimeout(() => setIsMounted(true), 50);

    // 检查是否需要验证
    const checkVerification = () => {
      // 若环境变量未配置密钥，跳过验证
      if (!ACCESS_KEY) {
        setIsVerified(true);
        setIsLoading(false);
        return;
      }

      // 检查 localStorage 是否已验证
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'true') {
        setIsVerified(true);
      }
      setIsLoading(false);
    };

    checkVerification();

    return () => clearTimeout(mountTimer);
  }, []);

  // ===== 事件处理 =====

  /**
   * 处理密钥验证
   * 使用 useCallback 优化性能
   */
  const handleVerify = useCallback(async () => {
    // 清空错误信息
    setError('');

    // 校验输入不能为空
    if (!inputKey.trim()) {
      setError('请输入访问密钥');
      return;
    }

    // 设置提交状态（显示加载动画）
    setIsSubmitting(true);

    // 模拟验证延迟，提升用户体验
    await new Promise(resolve => setTimeout(resolve, 600));

    // 验证密钥
    if (inputKey.trim() === ACCESS_KEY) {
      // 验证通过，存储状态
      localStorage.setItem(STORAGE_KEY, 'true');
      setIsVerified(true);
    } else {
      // 验证失败，显示错误
      setError('密钥错误，请重新输入');
      setInputKey('');
    }

    setIsSubmitting(false);
  }, [inputKey]);

  /**
   * 处理键盘事件（Enter 键提交）
   * @param {React.KeyboardEvent} e - 键盘事件
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting) {
      handleVerify();
    }
  }, [handleVerify, isSubmitting]);

  /**
   * 切换密码可见性
   */
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // ===== 渲染 =====

  // 加载状态显示空白或最小化加载
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 验证通过，渲染子组件
  if (isVerified) {
    return <>{children}</>;
  }

  // 显示访问验证界面
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* 背景装饰元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 左上角装饰圆 */}
        <div
          className={`absolute -top-40 -left-40 w-80 h-80 rounded-full bg-gray-50 transition-all duration-1000 ${
            isMounted ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
        />
        {/* 右下角装饰圆 */}
        <div
          className={`absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-gray-50 transition-all duration-1000 delay-200 ${
            isMounted ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
        />
        {/* 细线装饰 */}
        <div
          className={`absolute top-1/4 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent transition-all duration-1000 delay-300 ${
            isMounted ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
          }`}
        />
      </div>

      {/* 主内容区域 */}
      <div
        className={`relative z-10 w-full max-w-md transition-all duration-700 ${
          isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Logo/品牌区域 */}
        <div className="text-center mb-12">
          {/* 图标容器 */}
          <div
            className={`inline-flex items-center justify-center w-20 h-20 mb-6 border border-gray-200 transition-all duration-500 delay-100 ${
              isMounted ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            }`}
          >
            <Shield className="w-10 h-10 text-black" strokeWidth={1.5} />
          </div>

          {/* 品牌名称 */}
          <h1
            className={`font-display text-3xl text-black mb-2 transition-all duration-500 delay-200 ${
              isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            素居
          </h1>

          {/* 副标题 */}
          <p
            className={`text-gray-1 text-sm font-body transition-all duration-500 delay-300 ${
              isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            受保护的访问区域
          </p>
        </div>

        {/* 验证表单 */}
        <div
          className={`bg-white border border-gray-200 p-8 transition-all duration-500 delay-400 ${
            isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {/* 标题 */}
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-5 h-5 text-black" strokeWidth={1.5} />
            <h2 className="font-body text-base text-black tracking-wide">
              请输入访问密钥
            </h2>
          </div>

          {/* 输入框容器 */}
          <div className="relative mb-4">
            <input
              type={showPassword ? 'text' : 'password'}
              value={inputKey}
              onChange={(e) => {
                setInputKey(e.target.value);
                if (error) setError('');
              }}
              onKeyDown={handleKeyDown}
              placeholder="Access Key"
              className={`w-full h-12 px-4 pr-12 bg-transparent border font-body text-sm placeholder:text-gray-400 focus:outline-none transition-all duration-200 ${
                error
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:border-black'
              }`}
              autoFocus
              disabled={isSubmitting}
            />

            {/* 密码可见性切换按钮 */}
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors duration-200"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" strokeWidth={1.5} />
              ) : (
                <Eye className="w-4 h-4" strokeWidth={1.5} />
              )}
            </button>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 text-red-500 text-xs font-body animate-pulse">
              {error}
            </div>
          )}

          {/* 提交按钮 */}
          <button
            onClick={handleVerify}
            disabled={isSubmitting}
            className="w-full h-12 bg-black text-white font-body text-sm tracking-wider flex items-center justify-center gap-2 hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>验证中...</span>
              </>
            ) : (
              <>
                <span>进入网站</span>
                <ArrowRight
                  className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                  strokeWidth={1.5}
                />
              </>
            )}
          </button>
        </div>

        {/* 底部提示 */}
        <p
          className={`text-center text-gray-400 text-xs font-body mt-8 transition-all duration-500 delay-500 ${
            isMounted ? 'opacity-100' : 'opacity-0'
          }`}
        >
          此网站受访问保护
        </p>
      </div>
    </div>
  );
}

/**
 * 清除访问验证状态
 * 用于调试或需要重新验证的场景
 */
export function clearAccessVerification(): void {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}

/**
 * 检查是否已验证
 * @returns {boolean} 是否已通过验证
 */
export function isAccessVerified(): boolean {
  if (!ACCESS_KEY) return true;
  return localStorage.getItem(STORAGE_KEY) === 'true';
}
