import { useState, useEffect } from 'react';
import { User, Lock, Mail, Phone, Save, Shield, Loader2, CheckCircle, AlertCircle, Edit3, X } from 'lucide-react';
import iconConfig from '@/assets/icons/sidebar/configuracion.png';
import { getAdminProfile, updateAdminProfile } from '@/services/adminService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

const getInputClasses = (isEditing) =>
  `w-full pl-11 pr-4 py-2.5 rounded-lg border text-sm transition-all outline-none ${
    isEditing
      ? 'bg-white dark:bg-[#141824] text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-xs'
      : 'bg-gray-100/90 dark:bg-[#111520] text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-800 cursor-not-allowed'
  }`;

const ProfilePage = () => {
  const toast = useToast();
  const { user: authUser } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '', email: '', telefono: '', currentPassword: '', newPassword: '', confirmPassword: '',
  });

  const [initialFormData, setInitialFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setMessage(null);
      try {
        const adminData = await getAdminProfile();
        const loaded = {
          nombre: adminData.nombre || '', email: adminData.email || '', telefono: adminData.telefono || '',
          currentPassword: '', newPassword: '', confirmPassword: '',
        };
        setFormData(loaded);
        setInitialFormData(loaded);
      } catch (err) {
        const fallback = {
          nombre: authUser?.nombre || '', email: authUser?.email || '', telefono: authUser?.telefono || '',
          currentPassword: '', newPassword: '', confirmPassword: '',
        };
        setFormData(fallback);
        setInitialFormData(fallback);
        if (!authUser) {
          setMessage({ type: 'error', text: err.message || 'Error al obtener datos del perfil' });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [authUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (message) setMessage(null);
  };

  const handleCancelEdit = () => {
    if (initialFormData) {
      setFormData(initialFormData);
    }
    setIsEditing(false);
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditing) return;
    setMessage(null);

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      const errText = 'Las contraseñas nuevas no coinciden.';
      setMessage({ type: 'error', text: errText });
      toast.error('Error de validación', errText);
      return;
    }

    if (formData.newPassword && !formData.currentPassword) {
      const errText = 'Debes ingresar tu contraseña actual para cambiarla.';
      setMessage({ type: 'error', text: errText });
      toast.error('Contraseña actual requerida', errText);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
      };

      if (formData.currentPassword) {
        payload.currentPassword = formData.currentPassword;
      }
      if (formData.newPassword) {
        payload.newPassword = formData.newPassword;
      }

      const updatedUser = await updateAdminProfile(payload);

      const updatedData = {
        nombre: updatedUser.nombre || formData.nombre,
        email: updatedUser.email || formData.email,
        telefono: updatedUser.telefono || formData.telefono,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      };

      setFormData(updatedData);
      setInitialFormData(updatedData);
      setIsEditing(false);

      const storedUser = localStorage.getItem('fiamas_user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          localStorage.setItem('fiamas_user', JSON.stringify({ ...parsed, ...updatedUser }));
        } catch {
          // ignore
        }
      }

      const successMsg = '¡Perfil y credenciales actualizados exitosamente!';
      setMessage({ type: 'success', text: successMsg });
      toast.success('Configuración guardada', 'Tus datos de cuenta han sido actualizados con éxito.');
    } catch (err) {
      const errMsg = err.message || 'Error al guardar los cambios del perfil.';
      setMessage({ type: 'error', text: errMsg });
      toast.error('Error al guardar', errMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full min-h-full space-y-4 animate-fade-soft">
      {/* Encabezado en dirección de Mi Cuenta con botón/símbolo de editar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <img src={iconConfig} alt="Configuración" className="w-9 h-9 sm:w-10 sm:h-10 object-contain flex-shrink-0" />
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Mi Cuenta</h1>
              {isEditing && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 animate-in fade-in duration-200">
                  Edición Habilitada
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Gestiona tus credenciales y datos de administrador.
            </p>
          </div>
        </div>

        {/* Símbolo de editar en dirección de Mi Cuenta para habilitar campos */}
        {!loading && (
          <button
            type="button"
            onClick={() => (isEditing ? handleCancelEdit() : setIsEditing(true))}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border shadow-xs cursor-pointer ${
              isEditing
                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 dark:text-rose-300 dark:border-rose-800'
                : 'bg-white/90 hover:bg-white text-gray-700 hover:text-teal-700 border-gray-200 dark:bg-white/10 dark:hover:bg-white/15 dark:text-slate-200 dark:border-white/10 hover:border-teal-500/40'
            }`}
            title={isEditing ? 'Cancelar edición y bloquear campos' : 'Habilitar edición de campos'}
          >
            {isEditing ? (
              <>
                <X className="w-4 h-4" />
                <span>Cancelar</span>
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Editar Cuenta</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Formulario con contenedor transparente estilo Dashboard (bg-white/85 dark:bg-[#1A1F2E]/80) */}
      <div className="w-full bg-white/85 dark:bg-[#1A1F2E]/80 rounded-xl shadow-sm border border-white/50 dark:border-white/10 backdrop-blur-xs transition-colors overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">Cargando información del perfil...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="p-6 md:p-8 space-y-6">
              {message && (
                <div
                  className={`flex items-center gap-2 p-4 rounded-lg text-sm border ${
                    message.type === 'success'
                      ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800'
                      : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
                  }`}
                >
                  {message.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  )}
                  <span>{message.text}</span>
                </div>
              )}

              {/* Información Personal */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2 border-b border-gray-200/50 dark:border-white/10 pb-3 mb-6">
                  <User className="w-5 h-5 text-teal-600 dark:text-teal-400" /> Información Personal
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre Completo *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-gray-400 dark:text-gray-500">
                        <User className="w-5 h-5" />
                      </span>
                      <input
                        required
                        disabled={!isEditing}
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        className={getInputClasses(isEditing)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Teléfono
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-gray-400 dark:text-gray-500">
                        <Phone className="w-5 h-5" />
                      </span>
                      <input
                        disabled={!isEditing}
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        placeholder="+51 999 888 777"
                        className={getInputClasses(isEditing)}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Correo Electrónico (Email) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-gray-400 dark:text-gray-500">
                        <Mail className="w-5 h-5" />
                      </span>
                      <input
                        required
                        disabled={!isEditing}
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={getInputClasses(isEditing)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Seguridad */}
              <div className="pt-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2 border-b border-gray-200/50 dark:border-white/10 pb-3 mb-6">
                  <Shield className="w-5 h-5 text-teal-600 dark:text-teal-400" /> Seguridad (Contraseña)
                </h3>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contraseña Actual
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-gray-400 dark:text-gray-500">
                        <Lock className="w-5 h-5" />
                      </span>
                      <input
                        disabled={!isEditing}
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        placeholder={isEditing ? 'Requerida solo si vas a cambiar tu contraseña o correo' : '••••••••••••'}
                        className={getInputClasses(isEditing)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nueva Contraseña
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-3 text-gray-400 dark:text-gray-500">
                          <Lock className="w-5 h-5" />
                        </span>
                        <input
                          disabled={!isEditing}
                          type="password"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          placeholder={isEditing ? 'Dejar en blanco para conservar' : '••••••••••••'}
                          className={getInputClasses(isEditing)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirmar Nueva Contraseña
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-3 text-gray-400 dark:text-gray-500">
                          <Lock className="w-5 h-5" />
                        </span>
                        <input
                          disabled={!isEditing}
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder={isEditing ? 'Repite la nueva contraseña' : '••••••••••••'}
                          className={getInputClasses(isEditing)}
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    * La nueva contraseña será protegida y cifrada con bcrypt en el servidor.
                  </p>
                </div>
              </div>
            </div>

            {/* Barra de pie de formulario */}
            <div className="px-6 py-4 bg-white/40 dark:bg-white/5 border-t border-gray-200/50 dark:border-white/10 flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {isEditing ? 'Modo de edición activo. Recuerda guardar tus cambios.' : 'Campos protegidos contra edición accidental.'}
              </span>

              <div className="flex items-center gap-3">
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 text-sm font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!isEditing || saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#1D9492] hover:bg-[#167876] text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Guardar Cambios
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
