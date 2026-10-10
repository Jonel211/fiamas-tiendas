/**
 * Sidebar
 * Menú lateral con 3 estados:
 * - Desktop: pin (fijo), hover (temporal), colapsado.
 * - Móvil: drawer off-canvas (fuera de pantalla por defecto).
 *
 * En móvil, el sidebar siempre se muestra expandido cuando está abierto.
 */

import { useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useClickOutside } from '@/hooks/useClickOutside';
import SidebarLogo from './SidebarLogo';
import SidebarNav from './SidebarNav';
import SidebarUser from './SidebarUser';

const Sidebar = ({ isMobile = false, isMobileOpen = false, onMobileClose }) => {
  const [isPinned, setIsPinned] = useState(true);
  const sidebarRef = useRef(null);

  // En móvil: siempre expandido si está abierto
  // En desktop: expandido solo si está pinneado
  const isExpanded = isMobile ? true : isPinned;

  const collapse = useCallback(() => {
    // Solo colapsamos automáticamente si no está pinneado y estamos en móvil
    // pero como el hover ya no está, solo dejamos la lógica para click outside si se desea,
    // o simplemente no colapsamos.
    if (!isMobile && !isPinned) setIsPinned(false);
  }, [isMobile, isPinned]);

  const pin = useCallback(() => {
    if (isMobile) {
      onMobileClose?.();
    }
  }, [isMobile, onMobileClose]);

  useClickOutside(sidebarRef, () => {
    if (!isMobile && !isMobileOpen && !isPinned) collapse();
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
        className={`
          flex flex-col h-screen transition-all duration-1000 ease-in-out
          bg-white dark:bg-[#141824]
          border-r border-gray-200 dark:border-white/5
          ${isExpanded ? 'w-60' : 'w-20'}
          ${isMobile
            ? `fixed top-0 left-0 z-50 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'
            }`
            : 'relative flex-shrink-0'
          }
        `}
      >
        <SidebarLogo isExpanded={isExpanded} />

        {/* Toggle Button for Desktop */}
        {!isMobile && (
          <button
            onClick={() => setIsPinned(!isPinned)}
            title={isPinned ? 'Colapsar menú' : 'Fijar menú'}
            className="absolute -right-3 top-8 w-6 h-6 bg-white dark:bg-[#1A1F2E] border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-[#1D9492] dark:hover:text-[#1D9492] hover:scale-110 transition-all z-10 shadow-sm"
          >
            {isPinned ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        )}

        <SidebarNav isExpanded={isExpanded} onNavigate={pin} />
        <SidebarUser isExpanded={isExpanded} />
      </aside>
    </>
  );
};

export default Sidebar;