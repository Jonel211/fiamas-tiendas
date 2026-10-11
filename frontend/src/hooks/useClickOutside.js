// src/hooks/useClickOutside.js
/**
 * useClickOutside
 * Hook que ejecuta un callback cuando el usuario hace click
 * fuera del elemento referenciado.
 */

import { useEffect } from 'react';

export const useClickOutside = (ref, callback) => {
  useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, callback]);
};