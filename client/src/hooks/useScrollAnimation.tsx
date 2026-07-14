import { useEffect, useRef, RefObject } from 'react';

interface IntersectionOptions extends IntersectionObserverInit {
  threshold?: number | number[];
  rootMargin?: string;
  root?: Element | Document | null;
}

export const useScrollAnimation = (options: IntersectionOptions = {}): RefObject<HTMLElement | null> => {
  const elementRef = useRef<HTMLElement | null>(null);
  const defaultOptions: IntersectionObserverInit = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    ...options,
  };

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('scroll-animated');
        observer.unobserve(entry.target);
      }
    }, defaultOptions);

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [defaultOptions]);

  return elementRef;
};
