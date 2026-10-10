/**
 * SidebarNav
 * Lista de navegación principal.
 * Soporta modo claro y oscuro.
 * El item activo se ve con fondo teal y texto blanco.
 */

import { NavLink } from 'react-router-dom';

import iconDashboard from '@/assets/icons/sidebar/dashboard.png';
import iconTiendas from '@/assets/icons/sidebar/tiendas.png';
import iconTenderos from '@/assets/icons/sidebar/tenderos.png';
import iconBackups from '@/assets/icons/sidebar/backups.png';
import iconReportes from '@/assets/icons/sidebar/reportes.png';
import iconAvisos from '@/assets/icons/sidebar/avisos.png';
import iconConfig from '@/assets/icons/sidebar/configuracion.png';

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
            `flex items-center rounded-lg text-[13.5px] font-medium transition-all ${isExpanded ? 'gap-3 px-3 py-2.5' : 'justify-center px-0 py-2.5'
            } ${isActive
              ? 'bg-[#1D9492] text-white shadow-sm'
              : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5'
            }`
          }
        >
          <img
            src={item.icon}
            alt=""
            className="w-[22px] h-[22px] object-contain flex-shrink-0"
          />
          <span className={`inline-block whitespace-nowrap overflow-hidden transition-all duration-1000 ease-in-out ${isExpanded ? 'max-w-[200px] opacity-100' : 'max-w-0 opacity-0'}`}>
            {item.label}
          </span>
        </NavLink>
      ))}
    </nav>
  );
};

export default SidebarNav;