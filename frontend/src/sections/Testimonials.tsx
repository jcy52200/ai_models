import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Chen',
    title: '室内设计师',
    avatar: '/avatar-1.jpg',
    rating: 5,
    text: '素居完全改变了我的生活空间。家具的质量和他们对细节的关注超出了我的期望。每一件单品都展现出卓越的工艺和设计理念。',
  },
  {
    id: 2,
    name: 'Michael Wang',
    title: '房主',
    avatar: '/avatar-2.jpg',
    rating: 5,
    text: '我找到素居非常高兴。他们的系列完美契合我的风格，客服也非常出色。从选购到配送，整个过程都很顺畅。',
  },
  {
    id: 3,
    name: 'Emily Liu',
    title: '建筑师',
    avatar: '/avatar-3.jpg',
    rating: 5,
    text: '我客厅的新沙发绝对完美。舒适、时尚，而且完全如描述所示。作为建筑师，我对细节要求很高，素居没有让我失望。',
  },
];

export default function Testimonials() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
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

  const goToSlide = (index: number) => {
    if (isAnimating || index === currentIndex) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const nextSlide = () => {
    goToSlide((currentIndex + 1) % testimonials.length);
  };

  const prevSlide = () => {
    goToSlide((currentIndex - 1 + testimonials.length) % testimonials.length);
  };

  // Auto-play
  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [isVisible, currentIndex]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-24 lg:py-32 bg-white overflow-hidden"
    >
      {/* Decorative quote */}
      <div className="absolute top-20 left-10 opacity-5">
        <Quote className="w-40 h-40" strokeWidth={1} />
      </div>

      <div className="w-full px-6 lg:px-12">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <h2
            className={`font-display text-3xl sm:text-4xl lg:text-5xl text-black transition-all duration-800 ${
              isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionTimingFunction: 'var(--ease-expo-out)' }}
          >
            客户评价
          </h2>

          {/* Navigation Arrows */}
          <div
            className={`hidden sm:flex items-center gap-3 transition-all duration-800 ${
              isVisible
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-10'
            }`}
            style={{
              transitionDelay: '200ms',
              transitionTimingFunction: 'var(--ease-expo-out)',
            }}
          >
            <button
              onClick={prevSlide}
              className="p-3 border border-gray-3 rounded-full hover:bg-black hover:text-white hover:border-black transition-all duration-300"
              aria-label="上一条评价"
            >
              <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <button
              onClick={nextSlide}
              className="p-3 border border-gray-3 rounded-full hover:bg-black hover:text-white hover:border-black transition-all duration-300"
              aria-label="下一条评价"
            >
              <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Testimonial Slider */}
        <div
          className={`relative max-w-4xl mx-auto transition-all duration-800 ${
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-10'
          }`}
          style={{
            transitionDelay: '300ms',
            transitionTimingFunction: 'var(--ease-expo-out)',
            perspective: '1500px',
          }}
        >
          <div className="relative overflow-hidden">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`transition-all duration-600 ${
                  index === currentIndex
                    ? 'opacity-100 translate-x-0 rotate-0'
                    : index < currentIndex
                    ? 'opacity-0 -translate-x-full -rotate-6 absolute inset-0'
                    : 'opacity-0 translate-x-full rotate-6 absolute inset-0'
                }`}
                style={{
                  transitionTimingFunction: 'var(--ease-expo-out)',
                  transformStyle: 'preserve-3d',
                }}
              >
                <div className="bg-gray-2 p-8 sm:p-12 lg:p-16">
                  {/* Stars */}
                  <div className="flex gap-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-black text-black"
                        strokeWidth={0}
                        style={{
                          animationDelay: `${i * 50}ms`,
                        }}
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="font-display text-xl sm:text-2xl lg:text-3xl text-black leading-relaxed mb-8">
                    "{testimonial.text}"
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-body text-base text-black font-medium">
                        {testimonial.name}
                      </div>
                      <div className="text-gray-1 text-sm font-body">
                        {testimonial.title}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-black w-6'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`转到第${index + 1}条评价`}
              />
            ))}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex sm:hidden justify-center gap-4 mt-8">
          <button
            onClick={prevSlide}
            className="p-3 border border-gray-3 rounded-full"
            aria-label="上一条评价"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <button
            onClick={nextSlide}
            className="p-3 border border-gray-3 rounded-full"
            aria-label="下一条评价"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </section>
  );
}
