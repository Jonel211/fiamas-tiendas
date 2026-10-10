import { useState } from 'react';
import { User, Lock, Mail, Phone, Save, Shield } from 'lucide-react';
import iconConfig from '@/assets/icons/sidebar/configuracion.png';

const ProfilePage = () => {
  const [formData, setFormData] = useState({
    name: 'Juan Pérez Administrador',
    email: 'admin@fiadodigital.com',
    phone: '+57 300 123 4567',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      alert('Las contraseñas nuevas no coinciden');
      return;
    }
    // Lógica para enviar a backend y hashear con bcrypt
    console.log('Datos a actualizar:', formData);
    alert('Perfil actualizado correctamente');
  };

  return (
    <div className="w-full h-full">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
            <img src={iconConfig} alt="" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Mi Cuenta</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Gestiona tus credenciales y preferencias de administrador.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1A1F2E] rounded-xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
          <form onSubmit={handleSubmit}>

            <div className="p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                <User className="w-5 h-5 text-teal-600" /> Información Personal
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre Completo</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400"><User className="w-5 h-5" /></span>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Teléfono</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400"><Phone className="w-5 h-5" /></span>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Correo Electrónico (Email)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400"><Mail className="w-5 h-5" /></span>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2 mb-6">
                  <Shield className="w-5 h-5 text-teal-600" /> Seguridad (Contraseña)
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contraseña Actual</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-400"><Lock className="w-5 h-5" /></span>
                      <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        placeholder="Requerida para confirmar cambios"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nueva Contraseña</label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-400"><Lock className="w-5 h-5" /></span>
                        <input
                          type="password"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          placeholder="Dejar en blanco para no cambiar"
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirmar Nueva Contraseña</label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-400"><Lock className="w-5 h-5" /></span>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirma la nueva contraseña"
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    * La contraseña será encriptada utilizando bcrypt en el servidor para garantizar la seguridad.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-[#1D9492] hover:bg-[#167876] text-white rounded-lg font-medium transition-colors shadow-sm"
              >
                <Save className="w-4 h-4" />
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
