/**
 * SidebarUser
 * Bloque inferior del sidebar: botón logout + "Administrador".
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/services/authService';
import { LogOut } from 'lucide-react';
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
      <div className={`py-4 border-t transition-colors bg-gray-50 dark:bg-transparent border-gray-200 dark:border-white/5 ${isExpanded ? 'px-3' : 'px-2'}`}>
        <button
          onClick={() => setShowModal(true)}
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
          className={`w-full flex items-center ${isExpanded ? 'justify-start gap-3 px-3' : 'justify-center px-0'} py-2.5 rounded-lg transition-all hover:bg-gray-200 dark:hover:bg-white/10 group`}
        >
          <LogOut className="w-6 h-6 text-red-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
          <span className={`inline-block text-[15px] font-bold text-gray-800 dark:text-slate-100 whitespace-nowrap overflow-hidden transition-all duration-1000 ease-in-out ${isExpanded ? 'max-w-[200px] opacity-100' : 'max-w-0 opacity-0'}`}>
            Administrador
          </span>
        </button>
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