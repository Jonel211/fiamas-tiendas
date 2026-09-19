/**
 * LogoutModal
 * Modal de confirmación para cerrar sesión.
 * - Overlay oscuro semi-transparente.
 * - Card blanco centrado con pregunta y 2 botones.
 * - Click en overlay o en "No" cierra el modal.
 */

const LogoutModal = ({ onConfirm, onCancel }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-8 w-[340px] text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-[17px] font-bold text-gray-900 mb-6">
          ¿Seguro que quieres salir?
        </h3>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-md font-semibold text-white transition-colors"
            style={{ backgroundColor: '#14C02E' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#10A326')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#14C02E')}
          >
            Si
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-md font-semibold text-gray-800 bg-slate-200 hover:bg-slate-300 transition-colors"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;