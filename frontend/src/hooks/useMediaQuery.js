/**
 * useMediaQuery
 * Hook que devuelve true/false según si el viewport coincide
 * con una media query dada. Reacciona a cambios de tamaño.
 *
 * Uso:
 *   const isMobile = useMediaQuery('(max-width: 1023px)');
 */

import { useState, useEffect } from 'react';

export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (event) => setMatches(event.matches);

    // Compatibilidad: Safari antiguo usa addListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      mediaQuery.addListener(handler);
    }

    // Verificar valor inicial por si cambió entre render y efecto
    setMatches(mediaQuery.matches);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        mediaQuery.removeListener(handler);
      }
    };
  }, [query]);

  return matches;
};