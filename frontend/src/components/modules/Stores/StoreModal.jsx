import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Loader2, AlertCircle } from 'lucide-react';
import ImagePicker from '@/components/ui/ImagePicker';

const StoreModal = ({
  isOpen,
  onClose,
  onSubmit,
  currentStore,
  onChange,
  vendors,
  isSubmitting,
  modalError
}) => {
  const [validationErrors, setValidationErrors] = useState({});

  if (!isOpen || !currentStore) return null;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const errors = {};

    const nombre = (currentStore.nombre || '').trim();
    if (!nombre || nombre.length < 2) {
      errors.nombre = 'El nombre de la tienda es obligatorio (mínimo 2 letras).';
    }

    const ruc = (currentStore.ruc || '').trim();
    if (ruc && !/^\d{11}$/.test(ruc)) {
      errors.ruc = `El RUC debe tener exactamente 11 dígitos numéricos (ingresaste ${ruc.length}).`;
    }

    const tel = (currentStore.telefono || '').trim();
    if (tel && !/^\d{9}$/.test(tel)) {
      errors.telefono = `El teléfono debe tener 9 dígitos numéricos (ingresaste ${tel.length}).`;
    }

    if (!currentStore.tendero_id) {
      errors.tendero_id = 'Debes asignar un tendero responsable.';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    onSubmit(e);
  };

  return createPortal(
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-6 sm:pt-10 overflow-y-auto bg-black/50 backdrop-blur-sm"
      style={{ top: 0, left: 0, right: 0, bottom: 0, margin: 0 }}
    >
      <div className="bg-white dark:bg-[#1A1F2E] rounded-xl shadow-xl w-full max-w-2xl max-h-[calc(100vh-3.5rem)] flex flex-col overflow-hidden border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center flex-shrink-0">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            {currentStore.id ? 'Editar Tienda' : 'Nueva Tienda'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto flex-1">
          {modalError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre de la Tienda *
              </label>
              <input
                required
                type="text"
                value={currentStore.nombre}
                onChange={(e) => {
                  onChange('nombre', e.target.value);
                  if (validationErrors.nombre) setValidationErrors((prev) => ({ ...prev, nombre: null }));
                }}
                className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:text-white outline-none text-sm transition-all ${
                  validationErrors.nombre
                    ? 'border-red-500 focus:ring-2 focus:ring-red-400'
                    : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-teal-500'
                }`}
                placeholder="Ej. Bodega Santa Rosa"
              />
              {validationErrors.nombre && (
                <p className="text-xs text-red-500 mt-1 font-medium">{validationErrors.nombre}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                RUC <span className="text-xs text-gray-400 font-normal">(11 dígitos opcional)</span>
              </label>
              <input
                type="text"
                maxLength={11}
                value={currentStore.ruc}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                  onChange('ruc', val);
                  if (validationErrors.ruc) setValidationErrors((prev) => ({ ...prev, ruc: null }));
                }}
                className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:text-white outline-none text-sm transition-all ${
                  validationErrors.ruc
                    ? 'border-red-500 focus:ring-2 focus:ring-red-400 bg-red-50/30 dark:bg-red-900/10'
                    : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-teal-500'
                }`}
                placeholder="11 dígitos (ej. 20123456789)"
              />
              {validationErrors.ruc && (
                <p className="text-xs text-red-500 mt-1 font-medium">{validationErrors.ruc}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Dirección
              </label>
              <input
                type="text"
                value={currentStore.direccion}
                onChange={(e) => onChange('direccion', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                placeholder="Av. Principal #123"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Teléfono <span className="text-xs text-gray-400 font-normal">(9 dígitos)</span>
              </label>
              <input
                type="tel"
                maxLength={9}
                value={currentStore.telefono}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 9);
                  onChange('telefono', val);
                  if (validationErrors.telefono) setValidationErrors((prev) => ({ ...prev, telefono: null }));
                }}
                className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:text-white outline-none text-sm transition-all ${
                  validationErrors.telefono
                    ? 'border-red-500 focus:ring-2 focus:ring-red-400 bg-red-50/30 dark:bg-red-900/10'
                    : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-teal-500'
                }`}
                placeholder="999888777"
              />
              {validationErrors.telefono && (
                <p className="text-xs text-red-500 mt-1 font-medium">{validationErrors.telefono}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Responsable (Tendero) *
              </label>
              {vendors && vendors.length > 0 ? (
                <>
                  <select
                    required
                    value={currentStore.tendero_id || ''}
                    onChange={(e) => {
                      onChange('tendero_id', e.target.value);
                      if (validationErrors.tendero_id) setValidationErrors((prev) => ({ ...prev, tendero_id: null }));
                    }}
                    className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:text-white outline-none text-sm transition-all ${
                      validationErrors.tendero_id
                        ? 'border-red-500 focus:ring-2 focus:ring-red-400'
                        : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-teal-500'
                    }`}
                  >
                    <option value="" disabled>Selecciona un tendero</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.nombres} {v.apellidos} ({v.telefono})
                      </option>
                    ))}
                  </select>
                  {validationErrors.tendero_id && (
                    <p className="text-xs text-red-500 mt-1 font-medium">{validationErrors.tendero_id}</p>
                  )}
                </>
              ) : (
                <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs border border-amber-200 dark:border-amber-800">
                  No hay tenderos registrados. Primero debes crear un tendero en la sección <strong>Tenderos</strong>.
                </div>
              )}
            </div>

            {/* Selector de Imagen con upload o URL */}
            <div className="md:col-span-2">
              <ImagePicker
                label="Logo o Imagen de la Tienda"
                value={currentStore.imagen_url}
                onChange={(val) => onChange('imagen_url', val)}
                placeholder="https://ejemplo.com/logo.png o sube un archivo"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={currentStore.activo}
                onChange={(e) => onChange('activo', e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tienda Activa</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={currentStore.qr_activo}
                onChange={(e) => onChange('qr_activo', e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Token QR Activo</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#1D9492] hover:bg-[#167876] text-white rounded-lg font-medium transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default StoreModal;
