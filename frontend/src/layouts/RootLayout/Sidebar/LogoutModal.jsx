/**
 * LogoutModal
 * Modal de confirmación para cerrar sesión.
 * Soporta modo claro y oscuro.
 */

const LogoutModal = ({ onConfirm, onCancel }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-[#242B3D] rounded-lg shadow-xl p-8 w-[340px] text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-[17px] font-bold text-gray-900 dark:text-slate-100 mb-6">
          ¿Seguro que quieres salir?
        </h3>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-md font-semibold text-white transition-colors bg-[#1D9492] hover:bg-[#238276] dark:bg-[#1D9492] dark:hover:bg-[#29a89d]"
          >
            Si
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-md font-semibold text-gray-800 dark:text-slate-200 bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/15 transition-colors"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;