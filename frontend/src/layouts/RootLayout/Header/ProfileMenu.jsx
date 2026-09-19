/**
 * ProfileMenu
 * Menú desplegable que aparece al hacer click en el ícono de perfil.
 * Opciones: Configuración y Cerrar sesión.
 * Se cierra al hacer click afuera.
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
      className="absolute right-0 top-full mt-2 w-[220px] bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-50"
    >
      {/* Configuración */}
      <button
        onClick={handleConfig}
        className="w-full flex items-center gap-3 px-4 py-3 text-left text-[14px] font-medium text-gray-800 hover:bg-gray-50 transition-colors"
      >
        <img src={iconConfig} alt="" className="w-5 h-5 object-contain" />
        <span>Configuración</span>
      </button>

      {/* Separador */}
      <div className="border-t border-gray-100" />

      {/* Cerrar sesión */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-4 py-3 text-left text-[14px] font-medium text-red-600 hover:bg-red-50 transition-colors"
      >
        <Power className="w-5 h-5" strokeWidth={2.5} />
        <span>Cerrar sesión</span>
      </button>
    </div>
  );
};

export default ProfileMenu;