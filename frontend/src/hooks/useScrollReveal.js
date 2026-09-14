/**
 * useScrollReveal
 * Hook que añade la clase "is-visible" a los elementos con [data-reveal]
 * cuando entran al viewport. Genera el efecto de "aparecer con fade + up".
 */

import { useEffect } from 'react';

export const useScrollReveal = () => {
  useEffect(() => {
    const items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            entry.target.style.transitionDelay = `${Math.min(i * 70, 210)}ms`;
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.15 }
    );

    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
};