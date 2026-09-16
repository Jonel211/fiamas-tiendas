/**
 * SidebarUser
 * Bloque inferior del sidebar:
 * - Avatar con iniciales.
 * - Nombre y rol del usuario logueado.
 * - Botón de cerrar sesión (ícono de salida).
 */

import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { logout, getCurrentUser } from '@/services/authService';

const SidebarUser = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const userName = user?.nombre || 'Administrador';
  const userRole = user?.rol === 'admin' ? 'Administrador' : user?.rol || 'Administrador';
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="px-4 py-4 border-t border-gray-100">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#1F8A4C] flex items-center justify-center flex-shrink-0">
          <span className="text-white font-semibold text-[12px]">{initials}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-gray-900 truncate">{userName}</p>
          <p className="text-[11px] text-gray-500 truncate">{userRole}</p>
        </div>
        <button
          onClick={handleLogout}
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
        >
          <LogOut className="w-[18px] h-[18px]" />
        </button>
      </div>
    </div>
  );
};

export default SidebarUser;