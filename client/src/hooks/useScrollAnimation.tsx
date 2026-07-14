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
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('scroll-animated');
        observer.unobserve(entry.target);
      }
    }, observerOptions);

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [observerOptions.threshold, observerOptions.rootMargin, observerOptions.root]);

  return elementRef;
};
