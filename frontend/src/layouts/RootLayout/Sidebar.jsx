// src/layouts/RootLayout/Sidebar.jsx
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

const navItems = [
  { to: '/panel', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/panel/tiendas', label: 'Tiendas', icon: Store },
  { to: '/panel/tenderos', label: 'Tenderos', icon: Users },
  { to: '/panel/backups', label: 'Backups', icon: HardDrive },
  { to: '/panel/reportes', label: 'Reportes', icon: FileText },
  { to: '/panel/avisos', label: 'Avisos', icon: Bell },
  { to: '/panel/configuracion', label: 'Configuración', icon: Settings },
];

const Sidebar = () => {
  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#1F8A4C]">
            <span className="text-white font-bold text-[14px]">F</span>
          </div>
          <div>
            <p className="text-[15px] font-semibold text-gray-900 leading-tight">Fiamas</p>
            <p className="text-[11px] text-gray-500 leading-tight">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
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

      {/* Usuario abajo */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#1F8A4C] flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-[12px]">JD</span>
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-gray-900 truncate">Juan Delgado</p>
            <p className="text-[11px] text-gray-500 truncate">Administrador</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;