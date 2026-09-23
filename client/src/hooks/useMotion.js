import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to detect if reduced motion is preferred by the user.
 */
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Custom hook for scroll-triggered reveal animations using IntersectionObserver.
 */
export function useScrollReveal(options = {}) {
  const { threshold = 0.15, rootMargin = '0px 0px -50px 0px', triggerOnce = true } = options;
  const ref = useRef(null);
  const prefersReduced = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (prefersReduced) return;

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) observer.unobserve(entry.target);
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce, prefersReduced]);

  return [ref, prefersReduced || isVisible];
}

/**
 * Custom hook for smooth animated number counting when visible.
 */
export function useAnimatedCounter(targetValue, duration = 1200, isVisible = true) {
  const prefersReduced = useReducedMotion();
  const numericTarget = typeof targetValue === 'number' 
    ? targetValue 
    : parseInt(String(targetValue).replace(/\D/g, ''), 10) || 0;
  
  const [count, setCount] = useState(() => (prefersReduced ? numericTarget : 0));

  useEffect(() => {
    if (!isVisible) return;

    if (prefersReduced || numericTarget === 0) {
      const frame = window.requestAnimationFrame(() => setCount(numericTarget));
      return () => window.cancelAnimationFrame(frame);
    }

    let startTimestamp = null;
    let animationFrameId = null;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing function: cubic ease-out
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * numericTarget));

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setCount(numericTarget);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);
    return () => {
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
    };
  }, [numericTarget, duration, isVisible, prefersReduced]);

  return count;
}

