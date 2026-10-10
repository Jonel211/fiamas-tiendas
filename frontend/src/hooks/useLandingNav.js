/**
 * useLandingNav
 * Hook que controla:
 * - El estado abierto/cerrado del menú hamburguesa en móvil.
 * - El link activo del navbar según la sección visible (IntersectionObserver).
 */

import { useState, useEffect } from 'react';

export const useLandingNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState('inicio');

  const toggle = () => setIsOpen((prev) => !prev);
  const close = () => setIsOpen(false);

  useEffect(() => {
    const sections = document.querySelectorAll('main section[id]');
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return { isOpen, activeId, toggle, close };
};