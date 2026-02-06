import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { content } from '../config/content';

const stats = content.about.stats;

export default function About() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative w-full py-24 lg:py-32 bg-white overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-32 h-32 rounded-full bg-gray-100/50 blur-3xl" />
      <div className="absolute bottom-20 left-10 w-40 h-40 rounded-full bg-gray-100/50 blur-3xl" />

      <div className="w-full px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-7xl mx-auto">
          {/* Left Content */}
          <div className="order-2 lg:order-1">
            {/* Title */}
            <h2
              className={`font-display text-3xl sm:text-4xl lg:text-5xl text-black mb-6 transition-all duration-800 ${isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10'
                }`}
              style={{
                transitionTimingFunction: 'var(--ease-expo-out)',
              }}
            >
              {content.about.title}
            </h2>

            {/* Description */}
            <div
              className={`space-y-4 transition-all duration-800 ${isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10'
                }`}
              style={{
                transitionDelay: '100ms',
                transitionTimingFunction: 'var(--ease-expo-out)',
              }}
            >
              {content.about.description.map((paragraph, index) => (
                <p key={index} className="text-gray-1 text-base lg:text-lg leading-relaxed font-body">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* CTA Button */}
            <a
              href="#categories"
              className={`inline-flex items-center gap-2 mt-8 text-black group transition-all duration-800 ${isVisible
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 -translate-x-8'
                }`}
              style={{
                transitionDelay: '200ms',
                transitionTimingFunction: 'var(--ease-spring)',
              }}
            >
              <span className="relative text-sm tracking-wider font-body">
                {content.about.cta}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-black transition-all duration-300 group-hover:w-full" />
              </span>
              <ArrowRight
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                strokeWidth={1.5}
              />
            </a>

            {/* Stats */}
            <div
              className={`grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-gray-3 transition-all duration-800 ${isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10'
                }`}
              style={{
                transitionDelay: '300ms',
                transitionTimingFunction: 'var(--ease-expo-out)',
              }}
            >
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="text-center lg:text-left"
                  style={{
                    animationDelay: `${400 + index * 100}ms`,
                  }}
                >
                  <div className="font-display text-2xl sm:text-3xl lg:text-4xl text-black">
                    {stat.value}
                  </div>
                  <div className="text-gray-1 text-xs sm:text-sm mt-1 font-body">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Image */}
          <div
            className={`order-1 lg:order-2 relative transition-all duration-1000 ${isVisible
                ? 'opacity-100 translate-x-0 rotate-0'
                : 'opacity-0 translate-x-20 rotate-3'
              }`}
            style={{
              transitionDelay: '200ms',
              transitionTimingFunction: 'var(--ease-expo-out)',
              perspective: '1200px',
            }}
          >
            <div className="relative aspect-[4/5] overflow-hidden group">
              <img
                src="/about-image.jpg"
                alt={content.about.imageAlt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                style={{
                  transitionTimingFunction: 'var(--ease-expo-out)',
                }}
              />
              {/* Subtle overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
            </div>

            {/* Floating decorative element */}
            <div
              className={`absolute -bottom-6 -left-6 w-24 h-24 border border-gray-3 transition-all duration-800 ${isVisible
                  ? 'opacity-100 scale-100 rotate-0'
                  : 'opacity-0 scale-0 -rotate-180'
                }`}
              style={{
                transitionDelay: '600ms',
                transitionTimingFunction: 'var(--ease-spring)',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
