import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Loader2, AlertCircle } from 'lucide-react';
import ImagePicker from '@/components/ui/ImagePicker';
import { verificarDuplicadoTendero } from '@/services/vendorService';

const VendorModal = ({
  isOpen,
  onClose,
  onSubmit,
  currentVendor,
  onChange,
  isSubmitting,
  modalError
}) => {
  const [validationErrors, setValidationErrors] = useState({});
  const [duplicateWarnings, setDuplicateWarnings] = useState({ dni: null, telefono: null });

  // Verificación en tiempo real de duplicado de DNI
  useEffect(() => {
    const dni = (currentVendor?.dni || '').trim();
    if (!dni || dni.length !== 8) {
      setDuplicateWarnings((prev) => (prev.dni ? { ...prev, dni: null } : prev));
      return;
    }
    if (currentVendor?.id && dni === currentVendor?.initialDni) {
      setDuplicateWarnings((prev) => (prev.dni ? { ...prev, dni: null } : prev));
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await verificarDuplicadoTendero({ dni });
        if (res?.existe) {
          setDuplicateWarnings((prev) => ({ ...prev, dni: res.mensaje || 'El DNI ya está registrado.' }));
        } else {
          setDuplicateWarnings((prev) => (prev.dni ? { ...prev, dni: null } : prev));
        }
      } catch (err) {
        console.error('Error al verificar duplicado de DNI:', err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [currentVendor?.dni, currentVendor?.id, currentVendor?.initialDni]);

  // Verificación en tiempo real de duplicado de teléfono
  useEffect(() => {
    const tel = (currentVendor?.telefono || '').trim();
    if (!tel || tel.length !== 9) {
      setDuplicateWarnings((prev) => (prev.telefono ? { ...prev, telefono: null } : prev));
      return;
    }
    if (currentVendor?.id && tel === currentVendor?.initialTelefono) {
      setDuplicateWarnings((prev) => (prev.telefono ? { ...prev, telefono: null } : prev));
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await verificarDuplicadoTendero({ telefono: tel });
        if (res?.existe) {
          setDuplicateWarnings((prev) => ({ ...prev, telefono: res.mensaje || 'El teléfono ya está registrado.' }));
        } else {
          setDuplicateWarnings((prev) => (prev.telefono ? { ...prev, telefono: null } : prev));
        }
      } catch (err) {
        console.error('Error al verificar duplicado de teléfono:', err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [currentVendor?.telefono, currentVendor?.id, currentVendor?.initialTelefono]);

  if (!isOpen || !currentVendor) return null;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const errors = {};

    const dni = (currentVendor.dni || '').trim();
    if (!dni) {
      errors.dni = 'El DNI es obligatorio.';
    } else if (!/^\d{8}$/.test(dni)) {
      errors.dni = `El DNI debe tener exactamente 8 dígitos (ingresaste ${dni.length}).`;
    } else if (duplicateWarnings.dni) {
      errors.dni = duplicateWarnings.dni;
    }

    const tel = (currentVendor.telefono || '').trim();
    if (!tel) {
      errors.telefono = 'El teléfono es obligatorio.';
    } else if (!/^\d{9}$/.test(tel)) {
      errors.telefono = `El teléfono debe tener exactamente 9 dígitos (ingresaste ${tel.length}).`;
    } else if (duplicateWarnings.telefono) {
      errors.telefono = duplicateWarnings.telefono;
    }

    if (!currentVendor.nombres || currentVendor.nombres.trim().length < 2) {
      errors.nombres = 'Ingresa un nombre válido (mínimo 2 letras).';
    }

    if (!currentVendor.apellidos || currentVendor.apellidos.trim().length < 2) {
      errors.apellidos = 'Ingresa los apellidos (mínimo 2 letras).';
    }

    const pwd = (currentVendor.password || '').trim();
    if (!currentVendor.id) {
      if (!pwd) {
        errors.password = 'La contraseña es obligatoria.';
      } else if (pwd.length < 4 || pwd.length > 6) {
        errors.password = 'La contraseña debe tener entre 4 y 6 caracteres.';
      }
    } else if (pwd && (pwd.length < 4 || pwd.length > 6)) {
      errors.password = 'La nueva contraseña debe tener entre 4 y 6 caracteres.';
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
            {currentVendor.id ? 'Editar Tendero' : 'Nuevo Tendero'}
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
                DNI * <span className="text-xs text-gray-400 font-normal">(8 dígitos)</span>
              </label>
              <input
                required
                type="text"
                maxLength={8}
                value={currentVendor.dni}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 8);
                  onChange('dni', val);
                  if (validationErrors.dni) setValidationErrors((prev) => ({ ...prev, dni: null }));
                }}
                className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:text-white outline-none text-sm transition-all ${
                  validationErrors.dni || duplicateWarnings.dni
                    ? 'border-red-500 focus:ring-2 focus:ring-red-400 bg-red-50/30 dark:bg-red-900/10'
                    : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-teal-500'
                }`}
                placeholder="Ej. 72345678"
              />
              {duplicateWarnings.dni && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{duplicateWarnings.dni}</span>
                </p>
              )}
              {validationErrors.dni && !duplicateWarnings.dni && (
                <p className="text-xs text-red-500 mt-1 font-medium">{validationErrors.dni}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Teléfono * <span className="text-xs text-gray-400 font-normal">(9 dígitos)</span>
              </label>
              <input
                required
                type="tel"
                maxLength={9}
                value={currentVendor.telefono}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 9);
                  onChange('telefono', val);
                  if (validationErrors.telefono) setValidationErrors((prev) => ({ ...prev, telefono: null }));
                }}
                className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:text-white outline-none text-sm transition-all ${
                  validationErrors.telefono || duplicateWarnings.telefono
                    ? 'border-red-500 focus:ring-2 focus:ring-red-400 bg-red-50/30 dark:bg-red-900/10'
                    : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-teal-500'
                }`}
                placeholder="Ej. 987654321"
              />
              {duplicateWarnings.telefono && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{duplicateWarnings.telefono}</span>
                </p>
              )}
              {validationErrors.telefono && !duplicateWarnings.telefono && (
                <p className="text-xs text-red-500 mt-1 font-medium">{validationErrors.telefono}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombres *
              </label>
              <input
                required
                type="text"
                value={currentVendor.nombres}
                onChange={(e) => {
                  onChange('nombres', e.target.value);
                  if (validationErrors.nombres) setValidationErrors((prev) => ({ ...prev, nombres: null }));
                }}
                className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:text-white outline-none text-sm transition-all ${
                  validationErrors.nombres
                    ? 'border-red-500 focus:ring-2 focus:ring-red-400'
                    : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-teal-500'
                }`}
                placeholder="Juan Carlos"
              />
              {validationErrors.nombres && (
                <p className="text-xs text-red-500 mt-1 font-medium">{validationErrors.nombres}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Apellidos *
              </label>
              <input
                required
                type="text"
                value={currentVendor.apellidos}
                onChange={(e) => {
                  onChange('apellidos', e.target.value);
                  if (validationErrors.apellidos) setValidationErrors((prev) => ({ ...prev, apellidos: null }));
                }}
                className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:text-white outline-none text-sm transition-all ${
                  validationErrors.apellidos
                    ? 'border-red-500 focus:ring-2 focus:ring-red-400'
                    : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-teal-500'
                }`}
                placeholder="Pérez Gómez"
              />
              {validationErrors.apellidos && (
                <p className="text-xs text-red-500 mt-1 font-medium">{validationErrors.apellidos}</p>
              )}
            </div>

            {/* Foto de perfil del tendero con ImagePicker */}
            <div className="md:col-span-2">
              <ImagePicker
                label="Foto de Perfil del Tendero"
                value={currentVendor.foto_perfil_url}
                onChange={(val) => onChange('foto_perfil_url', val)}
                placeholder="https://ejemplo.com/perfil.jpg o sube un archivo"
              />
            </div>

            <div className={currentVendor.id ? 'md:col-span-2' : ''}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contraseña {currentVendor.id ? '(Opcional, 4 a 6 caracteres)' : '* (4 a 6 caracteres)'}
              </label>
              <input
                type="password"
                maxLength={6}
                placeholder={currentVendor.id ? 'Dejar en blanco para conservar la actual' : 'Entre 4 y 6 caracteres'}
                required={!currentVendor.id}
                value={currentVendor.password}
                onChange={(e) => {
                  onChange('password', e.target.value);
                  if (validationErrors.password) setValidationErrors((prev) => ({ ...prev, password: null }));
                }}
                className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:text-white outline-none text-sm transition-all ${
                  validationErrors.password
                    ? 'border-red-500 focus:ring-2 focus:ring-red-400'
                    : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-teal-500'
                }`}
              />
              {validationErrors.password && (
                <p className="text-xs text-red-500 mt-1 font-medium">{validationErrors.password}</p>
              )}
            </div>

            {!currentVendor.id && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre de su Tienda Inicial
                </label>
                <input
                  type="text"
                  placeholder="Ej. Bodega Central"
                  value={currentVendor.nombre_tienda || ''}
                  onChange={(e) => onChange('nombre_tienda', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={currentVendor.activo}
                onChange={(e) => onChange('activo', e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Usuario Activo</span>
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

export default VendorModal;
