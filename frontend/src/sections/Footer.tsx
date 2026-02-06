import { useEffect, useRef, useState } from 'react';
import { siteConfig } from '../config/theme';
import { content } from '../config/content';

const pageLinks = content.footer.sections.pages.links;
const infoLinks = content.footer.sections.info.links;
const socialLinks = content.footer.sections.social.links;

export default function Footer() {
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef<HTMLDivElement>(null);

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

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (href: string) => {
    if (href === '#') return;
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer
      id="footer"
      ref={footerRef}
      className="relative w-full bg-gray-2 pt-20 pb-8"
    >
      <div className="w-full px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 pb-12">
            {/* Brand Column */}
            <div
              className={`col-span-2 md:col-span-1 transition-all duration-600 ${isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-5'
                }`}
              style={{ transitionTimingFunction: 'var(--ease-expo-out)' }}
            >
              <a
                href="#hero"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('#hero');
                }}
                className="font-display text-3xl text-black hover:opacity-80 transition-opacity duration-300"
              >
                {siteConfig.name}
              </a>
              <p
                className={`mt-4 text-gray-1 text-sm leading-relaxed font-body transition-all duration-600 ${isVisible
                    ? 'opacity-100'
                    : 'opacity-0'
                  }`}
                style={{
                  transitionDelay: '100ms',
                  transitionTimingFunction: 'var(--ease-expo-out)',
                }}
              >
                {content.footer.tagline}
              </p>
            </div>

            {/* Pages Column */}
            <div
              className={`transition-all duration-600 ${isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-5'
                }`}
              style={{
                transitionDelay: '100ms',
                transitionTimingFunction: 'var(--ease-expo-out)',
              }}
            >
              <h4 className="font-body text-sm font-medium text-black mb-4 tracking-wider">
                {content.footer.sections.pages.title}
              </h4>
              <ul className="space-y-3">
                {pageLinks.map((link, index) => (
                  <li
                    key={link.name}
                    className={`transition-all duration-400 ${isVisible
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-4'
                      }`}
                    style={{
                      transitionDelay: `${150 + index * 50}ms`,
                      transitionTimingFunction: 'var(--ease-expo-out)',
                    }}
                  >
                    <a
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(link.href);
                      }}
                      className="text-gray-1 text-sm font-body hover:text-black hover:translate-x-1 inline-block transition-all duration-200"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Info Column */}
            <div
              className={`transition-all duration-600 ${isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-5'
                }`}
              style={{
                transitionDelay: '200ms',
                transitionTimingFunction: 'var(--ease-expo-out)',
              }}
            >
              <h4 className="font-body text-sm font-medium text-black mb-4 tracking-wider">
                {content.footer.sections.info.title}
              </h4>
              <ul className="space-y-3">
                {infoLinks.map((link, index) => (
                  <li
                    key={link.name}
                    className={`transition-all duration-400 ${isVisible
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-4'
                      }`}
                    style={{
                      transitionDelay: `${250 + index * 50}ms`,
                      transitionTimingFunction: 'var(--ease-expo-out)',
                    }}
                  >
                    <a
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(link.href);
                      }}
                      className="text-gray-1 text-sm font-body hover:text-black hover:translate-x-1 inline-block transition-all duration-200"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social Column */}
            <div
              className={`transition-all duration-600 ${isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-5'
                }`}
              style={{
                transitionDelay: '300ms',
                transitionTimingFunction: 'var(--ease-expo-out)',
              }}
            >
              <h4 className="font-body text-sm font-medium text-black mb-4 tracking-wider">
                {content.footer.sections.social.title}
              </h4>
              <ul className="space-y-3">
                {socialLinks.map((link, index) => (
                  <li
                    key={link.name}
                    className={`transition-all duration-400 ${isVisible
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-4'
                      }`}
                    style={{
                      transitionDelay: `${350 + index * 50}ms`,
                      transitionTimingFunction: 'var(--ease-expo-out)',
                    }}
                  >
                    <a
                      href={link.href}
                      className="text-gray-1 text-sm font-body hover:text-black hover:translate-x-1 inline-block transition-all duration-200"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div
            className={`h-[1px] bg-gray-3 transition-transform duration-800 origin-left ${isVisible ? 'scale-x-100' : 'scale-x-0'
              }`}
            style={{
              transitionDelay: '500ms',
              transitionTimingFunction: 'var(--ease-expo-out)',
            }}
          />

          {/* Bottom Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
            <p
              className={`text-gray-1 text-xs font-body transition-all duration-600 ${isVisible ? 'opacity-100' : 'opacity-0'
                }`}
              style={{
                transitionDelay: '600ms',
                transitionTimingFunction: 'var(--ease-expo-out)',
              }}
            >
              {content.footer.copyright}
            </p>

            {/* Payment Methods */}
            <div
              className={`flex items-center gap-4 transition-all duration-600 ${isVisible ? 'opacity-100' : 'opacity-0'
                }`}
              style={{
                transitionDelay: '700ms',
                transitionTimingFunction: 'var(--ease-expo-out)',
              }}
            >
              <span className="text-gray-1 text-xs font-body">{content.footer.paymentLabel}</span>
              <div className="flex gap-3">
                {content.footer.paymentMethods.map((method, index) => (
                  <span
                    key={method}
                    className={`px-3 py-1 bg-white border border-gray-3 text-xs text-gray-1 font-body transition-all duration-300 hover:border-black hover:text-black cursor-pointer ${isVisible ? 'animate-scale-in' : ''
                      }`}
                    style={{
                      animationDelay: `${800 + index * 80}ms`,
                      animationTimingFunction: 'var(--ease-spring)',
                    }}
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
