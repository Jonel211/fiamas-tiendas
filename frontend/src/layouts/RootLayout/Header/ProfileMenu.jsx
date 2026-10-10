/**
 * ProfileMenu
 * Menú desplegable del ícono de perfil.
 * Soporta modo claro y oscuro.
 */

import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Power } from 'lucide-react';
import { useClickOutside } from '@/hooks/useClickOutside';
import iconConfig from '@/assets/icons/configuracion.png';

const ProfileMenu = ({ onClose, onLogout }) => {
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useClickOutside(menuRef, onClose);

  const handleConfig = () => {
    onClose();
    navigate('/panel/configuracion');
  };

  const handleLogout = () => {
    onClose();
    onLogout();
  };

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-full mt-2 w-[220px] bg-white dark:bg-[#242B3D] rounded-lg shadow-lg dark:shadow-xl border border-gray-100 dark:border-white/5 overflow-hidden z-50"
    >
      <button
        onClick={handleConfig}
        className="w-full flex items-center gap-3 px-4 py-3 text-left text-[14px] font-medium text-gray-800 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
      >
        <img src={iconConfig} alt="" className="w-5 h-5 object-contain" />
        <span>Configuración</span>
      </button>

      <div className="border-t border-gray-100 dark:border-white/5" />

      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-4 py-3 text-left text-[14px] font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
      >
        <Power className="w-5 h-5" strokeWidth={2.5} />
        <span>Cerrar sesión</span>
      </button>
    </div>
  );
};

export default ProfileMenu;