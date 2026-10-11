/**
 * useStepper
 * Hook que controla el stepper "Cómo funciona":
 * - Estado del paso actual.
 * - Autoplay (cambia cada 4.5s cuando el stepper está visible).
 * - Detecta si el stepper está visible en pantalla (IntersectionObserver).
 */

import { useState, useRef, useEffect } from 'react';

export const useStepper = (totalSteps, autoplayMs = 4500) => {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(false);
  const containerRef = useRef(null);

  const goTo = (index) => setCurrent((index + totalSteps) % totalSteps);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.35 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % totalSteps);
    }, autoplayMs);
    return () => clearInterval(timer);
  }, [visible, totalSteps, autoplayMs]);

  return { current, goTo, containerRef };
};