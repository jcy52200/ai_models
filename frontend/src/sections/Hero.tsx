import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { content } from '../config/content';

export default function Hero() {
  const [isLoaded, setIsLoaded] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current || !contentRef.current) return;

      const scrollY = window.scrollY;
      const heroHeight = heroRef.current.offsetHeight;
      const progress = Math.min(scrollY / (heroHeight * 0.5), 1);

      // Parallax effect for background
      const bgElement = heroRef.current.querySelector('.hero-bg') as HTMLElement;
      if (bgElement) {
        bgElement.style.transform = `translateY(${scrollY * 0.3}px) scale(${1.1 - progress * 0.1})`;
      }

      // Fade and scale content
      if (contentRef.current) {
        contentRef.current.style.opacity = `${1 - progress}`;
        contentRef.current.style.transform = `translateY(${-scrollY * 0.2}px) scale(${1 - progress * 0.05})`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToProducts = () => {
    const element = document.querySelector('#products');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative w-full h-screen min-h-[700px] overflow-hidden"
    >
      {/* Background Image with Ken Burns effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`hero-bg absolute inset-0 bg-cover bg-center transition-transform duration-[8000ms] ${isLoaded ? 'scale-100' : 'scale-110'
            }`}
          style={{
            backgroundImage: 'url(/hero-bg.jpg)',
            transitionTimingFunction: 'var(--ease-smooth)',
          }}
        />
        {/* Gradient Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
        />
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center text-white"
      >
        {/* Title */}
        <h1
          className={`font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight max-w-4xl transition-all duration-800 ${isLoaded
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-16'
            }`}
          style={{
            transitionDelay: '300ms',
            transitionTimingFunction: 'var(--ease-expo-out)',
            textShadow: '0 2px 20px rgba(0,0,0,0.3)',
          }}
        >
          {content.hero.title.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              {i < content.hero.title.split('\n').length - 1 && <br />}
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <p
          className={`mt-6 text-lg sm:text-xl text-white/90 max-w-xl font-body font-light transition-all duration-600 ${isLoaded
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-8'
            }`}
          style={{
            transitionDelay: '500ms',
            transitionTimingFunction: 'var(--ease-expo-out)',
            textShadow: '0 1px 10px rgba(0,0,0,0.3)',
          }}
        >
          {content.hero.subtitle}
        </p>

        {/* CTA Button */}
        <button
          onClick={scrollToProducts}
          className={`mt-10 group flex items-center gap-3 px-8 py-4 border border-white/80 text-white rounded-none
            hover:bg-white hover:text-black transition-all duration-300 ${isLoaded
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-90'
            }`}
          style={{
            transitionDelay: '700ms',
            transitionTimingFunction: 'var(--ease-spring)',
          }}
        >
          <span className="text-sm tracking-wider font-body">{content.hero.cta}</span>
          <ArrowRight
            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-2"
            strokeWidth={1.5}
          />
        </button>
      </div>

      {/* Scroll Indicator */}
      <div
        className={`absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all duration-600 ${isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        style={{
          transitionDelay: '1000ms',
          transitionTimingFunction: 'var(--ease-expo-out)',
        }}
      >
        <span className="text-xs text-white/70 tracking-widest font-body">
          {content.hero.scrollHint}
        </span>
        <ChevronDown
          className="w-5 h-5 text-white/70 animate-bounce"
          strokeWidth={1.5}
          style={{ animationDuration: '2s' }}
        />
      </div>
    </section>
  );
}
