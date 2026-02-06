import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, Sparkles } from 'lucide-react';
import NotificationDropdown from '../components/NotificationDropdown';
import { siteConfig } from '../config/theme';
import { content } from '../config/content';

const navLinks = content.header.nav;

import { useCart } from '../contexts';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 关闭移动端菜单当路由变化时
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleNavClick = (href: string) => {
    if (href.startsWith('/#')) {
      // 锚点链接
      const elementId = href.replace('/#', '');
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/');
        setTimeout(() => {
          const el = document.getElementById(elementId);
          el?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      navigate(href);
    }
    setIsMobileMenuOpen(false);
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href.replace('/#', ''));
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-[0_2px_20px_rgba(0,0,0,0.08)]'
          : 'bg-transparent'
          }`}
        style={{ transitionTimingFunction: 'var(--ease-expo-out)' }}
      >
        <div className="w-full px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <button
              onClick={() => navigate('/')}
              className={`font-display text-2xl tracking-wide transition-transform duration-500 ${isScrolled ? 'scale-[0.85]' : 'scale-100'
                }`}
              style={{ transitionTimingFunction: 'var(--ease-expo-out)' }}
            >
              {siteConfig.name}
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-10">
              {navLinks.map((link, index) => (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.href)}
                  className={`relative text-sm font-body transition-colors duration-300 group ${isActive(link.href) ? 'text-black' : 'text-black/80 hover:text-black'
                    }`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  {link.name}
                  <span className={`absolute -bottom-1 left-1/2 h-[1px] bg-black transition-all duration-300 ${isActive(link.href) ? 'w-full left-0' : 'w-0 group-hover:w-full group-hover:left-0'
                    }`} />
                </button>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-5">
              {/* AI Chat */}
              <button
                onClick={() => navigate('/ai-chat')}
                className="relative p-2 hover:bg-black/5 rounded-full transition-all duration-300 group"
                aria-label="AI助手"
              >
                <Sparkles className="w-5 h-5 text-black group-hover:text-purple-600 transition-colors" strokeWidth={1.5} />
              </button>

              {/* Notifications */}
              <NotificationDropdown />

              {/* Cart */}
              <button
                onClick={() => navigate('/cart')}
                className="relative p-2 hover:bg-black/5 rounded-full transition-all duration-300 hover:rotate-[15deg] hover:-translate-y-[3px]"
                aria-label="购物车"
              >
                <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* User */}
              <button
                onClick={() => navigate('/profile')}
                className="p-2 hover:bg-black/5 rounded-full transition-colors duration-300 hidden sm:block"
                aria-label="用户"
              >
                <User className="w-5 h-5" strokeWidth={1.5} />
              </button>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 hover:bg-black/5 rounded-full transition-colors duration-300"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="菜单"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" strokeWidth={1.5} />
                ) : (
                  <Menu className="w-5 h-5" strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Border line when scrolled */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-[1px] bg-black/10 transition-opacity duration-500 ${isScrolled ? 'opacity-100' : 'opacity-0'
            }`}
        />
      </header>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 bg-white transition-all duration-500 md:hidden ${isMobileMenuOpen
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none'
          }`}
        style={{ transitionTimingFunction: 'var(--ease-expo-out)' }}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8">
          {navLinks.map((link, index) => (
            <button
              key={link.name}
              onClick={() => handleNavClick(link.href)}
              className={`font-display text-3xl transition-all duration-300 ${isActive(link.href) ? 'text-black' : 'text-black/60'
                } ${isMobileMenuOpen
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-4 opacity-0'
                }`}
              style={{
                transitionDelay: isMobileMenuOpen ? `${index * 80}ms` : '0ms',
                transitionTimingFunction: 'var(--ease-expo-out)',
              }}
            >
              {link.name}
            </button>
          ))}
          <div className="flex gap-6 mt-8">
            <button
              onClick={() => { navigate('/cart'); setIsMobileMenuOpen(false); }}
              className="p-4 border border-gray-3"
            >
              <ShoppingBag className="w-6 h-6" />
            </button>
            <button
              onClick={() => { navigate('/profile'); setIsMobileMenuOpen(false); }}
              className="p-4 border border-gray-3"
            >
              <User className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
