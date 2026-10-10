/**
 * RootLayout
 * Layout principal del panel administrativo.
 * Estructura de capas:
 * - Fondo de imagen (estático, no scrollea).
 * - Overlay muy sutil para legibilidad.
 * - Contenido scrollable (Outlet).
 *
 * En móvil el sidebar funciona como drawer (off-canvas).
 */

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar/Sidebar';
import Header from './Header/Header';
import { useTheme } from '@/context/ThemeContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import panelBgLight from '@/assets/images/panel-bg-light.jpg';
import panelBgDark from '@/assets/images/panel-bg-dark.jpg';

const RootLayout = () => {
  const { theme } = useTheme();
  const bgImage = theme === 'dark' ? panelBgDark : panelBgLight;

  const isMobile = useMediaQuery('(max-width: 1023px)');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-[#1A1F2E]">
      <Sidebar
        isMobile={isMobile}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />

        <div className="relative flex-1 overflow-hidden">
          <img
            src={bgImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          />

          <div className="absolute inset-0 bg-white/10 dark:bg-[#0F1420]/30 pointer-events-none" />

          <div className="relative h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RootLayout;