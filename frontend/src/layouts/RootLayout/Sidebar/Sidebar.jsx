/**
 * Sidebar
 * Menú lateral con 3 estados:
 * - Desktop: pin (fijo), hover (temporal), colapsado.
 * - Móvil: drawer off-canvas (fuera de pantalla por defecto).
 *
 * En móvil, el sidebar siempre se muestra expandido cuando está abierto.
 */

import { useState, useRef, useCallback } from 'react';
import { useClickOutside } from '@/hooks/useClickOutside';
import SidebarLogo from './SidebarLogo';
import SidebarNav from './SidebarNav';
import SidebarUser from './SidebarUser';

const Sidebar = ({ isMobile = false, isMobileOpen = false, onMobileClose }) => {
  const [isPinned, setIsPinned] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const sidebarRef = useRef(null);

  // En móvil: siempre expandido si está abierto
  // En desktop: expandido si está pinneado o hover
  const isExpanded = isMobile ? true : isPinned || isHovered;

  const collapse = useCallback(() => {
    if (!isMobile) setIsPinned(false);
  }, [isMobile]);

  const pin = useCallback(() => {
    if (isMobile) {
      onMobileClose?.();
    } else {
      setIsPinned(true);
    }
  }, [isMobile, onMobileClose]);

  useClickOutside(sidebarRef, () => {
    if (!isMobile && !isMobileOpen) collapse();
  });

  return (
    <>
      {/* Overlay oscuro - solo visible en móvil cuando el drawer está abierto */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        ref={sidebarRef}
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
        className={`
          flex flex-col h-screen transition-all duration-300 ease-in-out
          bg-white dark:bg-[#141824]
          border-r border-gray-200 dark:border-white/5
          ${isExpanded ? 'w-60' : 'w-20'}
          ${
            isMobile
              ? `fixed top-0 left-0 z-50 ${
                  isMobileOpen ? 'translate-x-0' : '-translate-x-full'
                }`
              : 'relative flex-shrink-0'
          }
        `}
      >
        <SidebarLogo isExpanded={isExpanded} />
        <SidebarNav isExpanded={isExpanded} onNavigate={pin} />
        <SidebarUser isExpanded={isExpanded} />
      </aside>
    </>
  );
};

export default Sidebar;