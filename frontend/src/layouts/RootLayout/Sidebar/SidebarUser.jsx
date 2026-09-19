/**
 * SidebarUser
 * Bloque inferior del sidebar:
 * - Logo custom + "Administrador".
 * - Botón de cerrar sesión que abre un modal de confirmación.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/services/authService';
import logoIcon from '@/assets/icons/logo.png';
import closeIcon from '@/assets/icons/close1.png';
import LogoutModal from './LogoutModal';

const SidebarUser = ({ isExpanded }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleConfirm = () => {
    setShowModal(false);
    logout();
    navigate('/login');
  };

  return (
    <>
      <div className={`py-4 border-t border-white/10 ${isExpanded ? 'px-3' : 'px-2'}`}>
        {isExpanded ? (
          <div className="flex items-center justify-between gap-2 px-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={logoIcon}
                alt=""
                className="w-6 h-6 object-contain flex-shrink-0"
              />
              <span className="text-[13px] font-medium text-white/85 truncate whitespace-nowrap">
                Administrador
              </span>
            </div>
            <button
              onClick={() => setShowModal(true)}
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              className="flex-shrink-0 transition-transform hover:scale-110 active:scale-95"
            >
              <img
                src={closeIcon}
                alt="Cerrar sesión"
                className="w-9 h-9 object-contain"
              />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={() => setShowModal(true)}
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              className="transition-transform hover:scale-110 active:scale-95"
            >
              <img
                src={closeIcon}
                alt="Cerrar sesión"
                className="w-10 h-10 object-contain"
              />
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <LogoutModal
          onConfirm={handleConfirm}
          onCancel={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default SidebarUser;