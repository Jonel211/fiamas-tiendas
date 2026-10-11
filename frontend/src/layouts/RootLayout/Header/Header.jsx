/**
 * Header
 * Barra superior del panel.
 * - En desktop (lg+): título + acciones.
 * - En móvil: botón hamburguesa + título + acciones.
 * Tamaños y espaciados responsive.
 */

import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import HeaderActions from './HeaderActions';

const PAGE_TITLES = {
  '/panel': 'Dashboard',
  '/panel/tiendas': 'Tiendas',
  '/panel/tenderos': 'Tenderos',
  '/panel/backups': 'Backups',
  '/panel/reportes': 'Reportes',
  '/panel/avisos': 'Avisos',
  '/panel/configuracion': 'Configuración',
};

const Header = ({ onMenuClick }) => {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] || 'Panel';

  return (
    <header className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 lg:px-8 h-14 sm:h-16 bg-white dark:bg-[#141824] border-b border-gray-200 dark:border-white/5 transition-colors">
      {/* Botón hamburguesa - solo en móvil */}
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Abrir menú"
        className="lg:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors flex-shrink-0"
      >
        <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Título */}
      <h1 className="flex-1 text-base sm:text-lg lg:text-xl font-semibold tracking-tight text-gray-800 dark:text-slate-100 truncate">
        {title}
      </h1>

      {/* Acciones */}
      <HeaderActions />
    </header>
  );
};

export default Header;