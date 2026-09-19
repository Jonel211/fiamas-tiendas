/**
 * Header
 * Barra superior del panel. Fondo verde con:
 * - Título dinámico según la ruta actual.
 * - Bloque de acciones (notificaciones, temas, perfil) en HeaderActions.
 */

import { useLocation } from 'react-router-dom';
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

const Header = () => {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] || 'Panel';

  return (
    <header className="flex items-center justify-between px-8 h-16 bg-[#1E88E5] text-white shadow-sm">
      <h1
        className="text-xl font-semibold tracking-tight"
        style={{ color: '#ffffff' }}
      >
        {title}
      </h1>
      <HeaderActions />
    </header>
  );
};

export default Header;