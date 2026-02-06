import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const categories = [
  {
    id: 1,
    name: '客厅',
    description: '放松与娱乐的空间',
    image: '/category-living.jpg',
  },
  {
    id: 2,
    name: '餐厅',
    description: '共享美食与回忆',
    image: '/category-dining.jpg',
  },
  {
    id: 3,
    name: '卧室',
    description: '您的私人避难所',
    image: '/category-bedroom.jpg',
  },
  {
    id: 4,
    name: '书房',
    description: '灵感与工作之地',
    image: '/category-study.jpg',
  },
];

export default function CategoryShowcase() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const checkScrollability = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollability, { passive: true });
      checkScrollability();
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScrollability);
      }
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 400;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section
      id="categories"
      ref={sectionRef}
      className="relative w-full py-24 lg:py-32 bg-white overflow-hidden"
    >
      <div className="w-full px-6 lg:px-12">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2
              className={`font-display text-3xl sm:text-4xl lg:text-5xl text-black transition-all duration-800 ${isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10'
                }`}
              style={{ transitionTimingFunction: 'var(--ease-expo-out)' }}
            >
              按分类浏览
            </h2>
            <p
              className={`mt-4 text-gray-1 text-base font-body transition-all duration-800 ${isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-6'
                }`}
              style={{
                transitionDelay: '100ms',
                transitionTimingFunction: 'var(--ease-expo-out)',
              }}
            >
              探索适合每个空间的家具系列
            </p>
          </div>

          {/* Navigation Arrows */}
          <div
            className={`hidden sm:flex items-center gap-3 transition-all duration-800 ${isVisible
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 translate-x-10'
              }`}
            style={{
              transitionDelay: '200ms',
              transitionTimingFunction: 'var(--ease-expo-out)',
            }}
          >
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`p-3 border border-gray-3 rounded-full transition-all duration-300 ${canScrollLeft
                ? 'hover:bg-black hover:text-white hover:border-black'
                : 'opacity-30 cursor-not-allowed'
                }`}
              aria-label="向左滚动"
            >
              <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`p-3 border border-gray-3 rounded-full transition-all duration-300 ${canScrollRight
                ? 'hover:bg-black hover:text-white hover:border-black'
                : 'opacity-30 cursor-not-allowed'
                }`}
              aria-label="向右滚动"
            >
              <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Horizontal Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {categories.map((category, index) => (
            <div
              key={category.id}
              className={`flex-shrink-0 w-[280px] sm:w-[320px] lg:w-[380px] group cursor-pointer transition-all duration-800 ${isVisible
                ? 'opacity-100 translate-x-0 rotate-0'
                : 'opacity-0 -translate-x-20 -rotate-6'
                }`}
              style={{
                transitionDelay: `${200 + index * 150}ms`,
                transitionTimingFunction: 'var(--ease-expo-out)',
                scrollSnapAlign: 'start',
                perspective: '1000px',
              }}
              onClick={() => navigate(`/search?category=${encodeURIComponent(category.id)}`)}
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                {/* Image */}
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.08]"
                  style={{ transitionTimingFunction: 'var(--ease-expo-out)' }}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3
                    className="font-display text-2xl lg:text-3xl transition-transform duration-500 group-hover:translate-y-0 translate-y-2"
                    style={{ transitionTimingFunction: 'var(--ease-expo-out)' }}
                  >
                    {category.name}
                  </h3>
                  <p
                    className="mt-2 text-sm text-white/80 font-body opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500"
                    style={{
                      transitionDelay: '100ms',
                      transitionTimingFunction: 'var(--ease-expo-out)',
                    }}
                  >
                    {category.description}
                  </p>
                </div>

                {/* Hover border effect */}
                <div className="absolute inset-0 border-4 border-white/0 group-hover:border-white/20 transition-all duration-500" />
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Scroll Indicator */}
        <div className="flex sm:hidden justify-center gap-2 mt-6">
          {categories.map((_, index) => (
            <div
              key={index}
              className="w-2 h-2 rounded-full bg-gray-300"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
