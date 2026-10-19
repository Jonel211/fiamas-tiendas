/**
 * LogoutModal
 * Modal de confirmación para cerrar sesión.
 * Usa createPortal en document.body para cubrir toda la pantalla en responsive y desktop
 * sin ser restringido por transformaciones CSS del sidebar.
 */

import { createPortal } from 'react-dom';

const LogoutModal = ({ onConfirm, onCancel }) => {
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] w-screen h-screen flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      style={{ top: 0, left: 0, right: 0, bottom: 0, margin: 0 }}
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-[#242B3D] rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-sm text-center border border-gray-100 dark:border-white/10 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-[17px] font-bold text-gray-900 dark:text-slate-100 mb-2">
          ¿Seguro que quieres salir?
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
          Se cerrará tu sesión actual en la plataforma.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-lg font-semibold text-white transition-colors bg-[#1D9492] hover:bg-[#167876] shadow-sm text-sm"
          >
            Si
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg font-semibold text-gray-700 dark:text-slate-200 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 transition-colors text-sm"
          >
            No
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LogoutModal;