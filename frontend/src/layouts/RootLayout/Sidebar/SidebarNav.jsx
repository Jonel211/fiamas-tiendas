/**
 * SidebarNav
 * Lista de enlaces de navegación principal del panel.
 * Resalta el link activo con fondo verde suave.
 */

import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Users,
  HardDrive,
  FileText,
  Bell,
  Settings,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/panel', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/panel/tiendas', label: 'Tiendas', icon: Store },
  { to: '/panel/tenderos', label: 'Tenderos', icon: Users },
  { to: '/panel/backups', label: 'Backups', icon: HardDrive },
  { to: '/panel/reportes', label: 'Reportes', icon: FileText },
  { to: '/panel/avisos', label: 'Avisos', icon: Bell },
  { to: '/panel/configuracion', label: 'Configuración', icon: Settings },
];

const SidebarNav = () => {
  return (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-colors ${
                isActive
                  ? 'bg-[#1F8A4C]/10 text-[#1F8A4C]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Icon className="w-[18px] h-[18px] flex-shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default SidebarNav;