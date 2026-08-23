import { useEffect, useRef, RefObject } from 'react';

interface IntersectionOptions extends IntersectionObserverInit {
  threshold?: number | number[];
  rootMargin?: string;
  root?: Element | Document | null;
}

export const useScrollAnimation = <T extends HTMLElement = HTMLElement>(options: IntersectionOptions = {}): RefObject<T | null> => {
  const elementRef = useRef<T | null>(null);
  const observerOptions = {
    threshold: options.threshold ?? 0.1,
    rootMargin: options.rootMargin ?? '0px 0px -50px 0px',
    root: options.root ?? null,
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let fallbackTimer: ReturnType<typeof setTimeout> | undefined;
    const showElement = () => {
      element.classList.add('scroll-animated');
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };

    if (typeof IntersectionObserver === 'undefined') {
      showElement();
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        showElement();
        observer.unobserve(entry.target);
      }
    }, observerOptions);

    observer.observe(element);
    fallbackTimer = setTimeout(showElement, 2500);

    return () => {
      if (fallbackTimer) clearTimeout(fallbackTimer);
      observer.disconnect();
    };
  }, [observerOptions.threshold, observerOptions.rootMargin, observerOptions.root]);

  return elementRef;
};
