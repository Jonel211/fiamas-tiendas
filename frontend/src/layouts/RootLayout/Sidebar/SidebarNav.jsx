/**
 * SidebarNav
 * Lista de navegación principal.
 * Al hacer click en un ícono, expande el sidebar.
 * Cuando colapsado, solo muestra íconos (con tooltip nativo).
 */

import { NavLink } from 'react-router-dom';

import iconDashboard from '@/assets/icons/dashboard.png';
import iconTiendas from '@/assets/icons/tiendas.png';
import iconTenderos from '@/assets/icons/tenderos.png';
import iconBackups from '@/assets/icons/backups.png';
import iconReportes from '@/assets/icons/reportes.png';
import iconAvisos from '@/assets/icons/avisos.png';
import iconConfig from '@/assets/icons/configuracion.png';

const NAV_ITEMS = [
  { to: '/panel', label: 'Dashboard', icon: iconDashboard, end: true },
  { to: '/panel/tiendas', label: 'Tiendas', icon: iconTiendas },
  { to: '/panel/tenderos', label: 'Tenderos', icon: iconTenderos },
  { to: '/panel/backups', label: 'Backups', icon: iconBackups },
  { to: '/panel/reportes', label: 'Reportes', icon: iconReportes },
  { to: '/panel/avisos', label: 'Avisos', icon: iconAvisos },
  { to: '/panel/configuracion', label: 'Configuración', icon: iconConfig },
];

const SidebarNav = ({ isExpanded, onNavigate }) => {
  return (
    <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          title={!isExpanded ? item.label : undefined}
          className={({ isActive }) =>
            `flex items-center rounded-lg text-[13.5px] font-medium transition-all ${
              isExpanded
                ? 'gap-3 px-3 py-2.5'
                : 'justify-center px-0 py-2.5'
            } ${
              isActive
                ? 'bg-[#1F8A4C]/25 text-white'
                : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`
          }
        >
          <img
            src={item.icon}
            alt=""
            className="w-[22px] h-[22px] object-contain flex-shrink-0"
          />
          {isExpanded && (
            <span className="whitespace-nowrap">{item.label}</span>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default SidebarNav;