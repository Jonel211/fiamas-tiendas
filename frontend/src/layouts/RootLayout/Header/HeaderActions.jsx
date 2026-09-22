/**
 * HeaderActions
 * Bloque de acciones del Header: notificaciones, tema, perfil, logout.
 * El sol (que aparece en dark mode) se muestra dorado.
 * Gap responsive entre botones.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { logout } from '@/services/authService';
import { useTheme } from '@/context/ThemeContext';
import HeaderIconButton from './HeaderIconButton';
import ProfileMenu from './ProfileMenu';
import LogoutModal from '../Sidebar/LogoutModal';

import iconBell from '@/assets/icons/avisos.png';
import iconMoon from '@/assets/icons/dark.png';
import iconSun from '@/assets/icons/light.png';
import iconProfile from '@/assets/icons/logo.png';

const HeaderActions = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate('/login');
  };

  const isDark = theme === 'dark';

  return (
    <>
      <div className="flex items-center gap-0.5 sm:gap-1 lg:gap-2">
        <HeaderIconButton icon={iconBell} label="Notificaciones" />

        <HeaderIconButton
          icon={isDark ? iconSun : iconMoon}
          label={isDark ? 'Modo claro' : 'Modo oscuro'}
          onClick={toggleTheme}
          tintColor={isDark ? '#E0AA3D' : undefined}
        />

        <div className="relative">
          <HeaderIconButton
            icon={iconProfile}
            label="Perfil"
            onClick={() => setShowProfileMenu((prev) => !prev)}
            isLogo
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