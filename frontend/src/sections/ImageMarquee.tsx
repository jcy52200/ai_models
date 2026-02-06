import { useEffect, useRef, useState, useCallback } from 'react';
import { content } from '../config/content';

/**
 * 展示图片配置数组
 * 从 content.ts 配置文件读取，支持未来添加更多图片
 * 只需在 content.ts 的 imageMarquee.images 数组中添加新的图片对象即可
 */
const SHOWCASE_IMAGES = content.imageMarquee.images;

/**
 * ImageMarquee 组件
 * 
 * 功能说明：
 * - 横向无限循环滚动展示图片
 * - 支持自动播放、悬停暂停、手动拖拽
 * - 滚入视口时触发渐入动画
 * - 完全响应式设计
 * 
 * @returns {JSX.Element} 图片滚动展示区块
 */
export default function ImageMarquee() {
  // ===== 状态管理 =====
  
  /**
   * 控制组件是否进入视口（用于触发渐入动画）
   * @type {boolean}
   */
  const [isVisible, setIsVisible] = useState(false);
  
  /**
   * 控制滚动是否暂停（悬停时暂停）
   * @type {boolean}
   */
  const [isPaused, setIsPaused] = useState(false);
  
  /**
   * 拖拽状态：是否正在拖拽
   * @type {boolean}
   */
  const [isDragging, setIsDragging] = useState(false);
  
  /**
   * 拖拽开始时的鼠标X坐标
   * @type {number}
   */
  const [startX, setStartX] = useState(0);
  
  /**
   * 拖拽开始时的滚动位置
   * @type {number}
   */
  const [scrollLeft, setScrollLeft] = useState(0);

  // ===== Refs =====
  
  /**
   * 区块容器的引用，用于 IntersectionObserver
   * @type {React.RefObject<HTMLElement>}
   */
  const sectionRef = useRef<HTMLElement>(null);
  
  /**
   * 滚动容器的引用，用于控制滚动位置
   * @type {React.RefObject<HTMLDivElement>}
   */
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  /**
   * 动画帧ID，用于取消动画
   * @type {React.MutableRefObject<number | null>}
   */
  const animationRef = useRef<number | null>(null);
  
  /**
   * 自动滚动速度（像素/帧）
   * @type {React.MutableRefObject<number>}
   */
  const scrollSpeedRef = useRef(0.5);

  // ===== 渐入动画效果 =====
  
  /**
   * 使用 IntersectionObserver 监听组件是否进入视口
   * 当进入视口 20% 时触发渐入动画
   */
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

  // ===== 自动滚动逻辑 =====
  
  /**
   * 自动滚动动画循环
   * 使用 requestAnimationFrame 实现平滑滚动
   * 当滚动到一半时重置位置，实现无缝循环
   */
  const autoScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || isPaused || isDragging) {
      animationRef.current = requestAnimationFrame(autoScroll);
      return;
    }

    // 获取当前滚动位置
    const currentScroll = container.scrollLeft;
    // 计算最大滚动位置（滚动宽度的一半，因为图片被复制了一份）
    const maxScroll = container.scrollWidth / 2;
    
    // 如果滚动超过一半，重置到起始位置（无缝循环）
    if (currentScroll >= maxScroll) {
      container.scrollLeft = 0;
    } else {
      // 否则继续滚动
      container.scrollLeft = currentScroll + scrollSpeedRef.current;
    }

    animationRef.current = requestAnimationFrame(autoScroll);
  }, [isPaused, isDragging]);

  /**
   * 启动自动滚动
   */
  useEffect(() => {
    animationRef.current = requestAnimationFrame(autoScroll);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [autoScroll]);

  // ===== 拖拽交互处理 =====
  
  /**
   * 处理鼠标按下事件，开始拖拽
   * @param {React.MouseEvent} e - 鼠标事件对象
   */
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  /**
   * 处理鼠标移动事件，执行拖拽
   * @param {React.MouseEvent} e - 鼠标事件对象
   */
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // 拖拽灵敏度系数
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  /**
   * 处理鼠标释放事件，结束拖拽
   */
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  /**
   * 处理鼠标离开事件，结束拖拽
   */
  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  /**
   * 处理触摸开始事件（移动端拖拽）
   * @param {React.TouchEvent} e - 触摸事件对象
   */
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return;
    
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  /**
   * 处理触摸移动事件（移动端拖拽）
   * @param {React.TouchEvent} e - 触摸事件对象
   */
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  /**
   * 处理触摸结束事件
   */
  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // ===== 渲染 =====
  
  /**
   * 复制图片数组以实现无缝循环效果
   * 当滚动到复制部分时，瞬间重置到原始部分
   */
  const duplicatedImages = [...SHOWCASE_IMAGES, ...SHOWCASE_IMAGES];

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-24 lg:py-32 bg-white overflow-hidden"
      aria-label="图片展示区域"
    >
      {/* 区块标题 */}
      <div className="w-full px-6 lg:px-12 mb-12">
        <div className="max-w-7xl mx-auto">
          <h2
            className={`font-display text-3xl sm:text-4xl lg:text-5xl text-black text-center transition-all duration-800 ${
              isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionTimingFunction: 'var(--ease-expo-out)' }}
          >
            {content.imageMarquee.title}
          </h2>
          <p
            className={`mt-4 text-gray-1 text-base lg:text-lg text-center font-body max-w-2xl mx-auto transition-all duration-800 ${
              isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10'
            }`}
            style={{
              transitionDelay: '100ms',
              transitionTimingFunction: 'var(--ease-expo-out)',
            }}
          >
            {content.imageMarquee.subtitle}
          </p>
        </div>
      </div>

      {/* 图片滚动容器 */}
      <div
        className={`relative transition-all duration-800 ${
          isVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-10'
        }`}
        style={{
          transitionDelay: '200ms',
          transitionTimingFunction: 'var(--ease-expo-out)',
        }}
      >
        {/* 左侧渐变遮罩 */}
        <div className="absolute left-0 top-0 bottom-0 w-16 lg:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        
        {/* 右侧渐变遮罩 */}
        <div className="absolute right-0 top-0 bottom-0 w-16 lg:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        {/* 可滚动容器 */}
        <div
          ref={scrollContainerRef}
          className={`flex gap-6 overflow-x-hidden select-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => {
            setIsPaused(false);
            handleMouseLeave();
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE/Edge
          }}
        >
          {/* 图片列表 - 复制一份实现无缝循环 */}
          {duplicatedImages.map((image, index) => (
            <div
              key={`${image.src}-${index}`}
              className="flex-shrink-0 relative group"
              style={{
                width: 'clamp(280px, 40vw, 480px)',
              }}
            >
              {/* 图片容器 */}
              <div className="relative aspect-[16/10] overflow-hidden bg-gray-2">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{
                    transitionTimingFunction: 'var(--ease-expo-out)',
                  }}
                  draggable={false}
                  loading="lazy"
                />
                
                {/* 悬停遮罩效果 */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 提示文字 */}
      <p
        className={`text-center text-gray-1 text-sm font-body mt-8 transition-all duration-600 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          transitionDelay: '400ms',
          transitionTimingFunction: 'var(--ease-expo-out)',
        }}
      >
        {content.imageMarquee.hint}
      </p>

      {/* 隐藏滚动条样式 */}
      <style>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
