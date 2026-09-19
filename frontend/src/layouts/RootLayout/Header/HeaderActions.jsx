/**
 * HeaderActions
 * Bloque de acciones del Header (lado derecho):
 * - Notificaciones, modo oscuro, modo claro.
 * - Perfil con menú desplegable (Configuración + Cerrar sesión).
 * - Modal de confirmación de logout.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { logout } from '@/services/authService';
import HeaderIconButton from './HeaderIconButton';
import ProfileMenu from './ProfileMenu';
import LogoutModal from '../Sidebar/LogoutModal';

import iconBell from '@/assets/icons/avisos.png';
import iconMoon from '@/assets/icons/dark.png';
import iconSun from '@/assets/icons/light.png';
import iconProfile from '@/assets/icons/logo.png';

const HeaderActions = () => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate('/login');
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <HeaderIconButton icon={iconBell} label="Notificaciones" />
        <HeaderIconButton icon={iconMoon} label="Modo oscuro" />
        <HeaderIconButton icon={iconSun} label="Modo claro" />

        <div className="relative">
          <HeaderIconButton
            icon={iconProfile}
            label="Perfil"
            onClick={() => setShowProfileMenu((prev) => !prev)}
          />
          {showProfileMenu && (
            <ProfileMenu
              onClose={() => setShowProfileMenu(false)}
              onLogout={() => setShowLogoutModal(true)}
            />
          )}
        </div>
      </div>

      {showLogoutModal && (
        <LogoutModal
          onConfirm={handleConfirmLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </>
  );
};

export default HeaderActions;