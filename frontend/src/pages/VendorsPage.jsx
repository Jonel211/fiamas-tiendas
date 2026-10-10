import { useState } from 'react';
import { Plus, Edit2, CheckCircle2, XCircle, Save, X } from 'lucide-react';
import iconTenderos from '@/assets/icons/sidebar/tenderos.png';

const initialVendors = [
  { id: 1, dni: '12345678', nombres: 'Juan Carlos', apellidos: 'Pérez', telefono: '999888777', activo: true, createdAt: '2023-10-01', updatedAt: '2023-10-05' },
  { id: 2, dni: '87654321', nombres: 'Ana María', apellidos: 'Gómez', telefono: '987654321', activo: false, createdAt: '2023-09-15', updatedAt: '2023-09-20' },
];

const VendorsPage = () => {
  const [vendors, setVendors] = useState(initialVendors);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVendor, setCurrentVendor] = useState(null);

  const openModal = (vendor = null) => {
    setCurrentVendor(vendor || { dni: '', nombres: '', apellidos: '', telefono: '', password_hash: '', activo: true });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentVendor(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentVendor.id) {
      // Edit
      setVendors(vendors.map(v => v.id === currentVendor.id ? { ...currentVendor, updatedAt: new Date().toISOString().split('T')[0] } : v));
    } else {
      // Create
      const newVendor = { ...currentVendor, id: Date.now(), createdAt: new Date().toISOString().split('T')[0], updatedAt: new Date().toISOString().split('T')[0] };
      setVendors([...vendors, newVendor]);
    }
    closeModal();
  };

  const toggleStatus = (id) => {
    setVendors(vendors.map(v => v.id === id ? { ...v, activo: !v.activo, updatedAt: new Date().toISOString().split('T')[0] } : v));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/20 rounded-xl flex items-center justify-center">
            <img src={iconTenderos} alt="" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Gestión de Tenderos</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Administra los tenderos registrados en el sistema.</p>
          </div>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-[#1D9492] hover:bg-[#167876] text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Nuevo Tendero
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-white dark:bg-[#1A1F2E] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
        <div className="flex-1 relative">
          <input 
            type="text" 
            placeholder="Buscar por nombre, DNI o teléfono..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#242B3D] border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9492] dark:text-white transition-all"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select className="px-4 py-2 bg-gray-50 dark:bg-[#242B3D] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1D9492] cursor-pointer">
          <option value="all">Todos los tenderos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>

      <div className="bg-white dark:bg-[#1A1F2E] rounded-xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">DNI / Nombre</th>
                <th className="px-6 py-4 font-medium">Contacto</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium">Fechas</th>
                <th className="px-6 py-4 font-medium text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {vendors.map(vendor => (
                <tr key={vendor.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">{vendor.nombres} {vendor.apellidos}</div>
                    <div className="text-sm text-gray-500">DNI: {vendor.dni}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-gray-300">{vendor.telefono}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${vendor.activo ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {vendor.activo ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {vendor.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-500">Creado: {vendor.createdAt}</div>
                    <div className="text-xs text-gray-500">Modif: {vendor.updatedAt}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => openModal(vendor)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors" title="Editar">
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button onClick={() => toggleStatus(vendor.id)} className={`${vendor.activo ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'} transition-colors`} title={vendor.activo ? "Deshabilitar" : "Habilitar"}>
                        {vendor.activo ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1A1F2E] rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">{currentVendor.id ? 'Editar Tendero' : 'Nuevo Tendero'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">DNI</label>
                  <input required type="text" value={currentVendor.dni} onChange={e => setCurrentVendor({ ...currentVendor, dni: e.target.value })} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña (cifrada en servidor)</label>
                  <input type="password" placeholder={currentVendor.id ? "Dejar en blanco para mantener" : "Requerida"} required={!currentVendor.id} onChange={e => setCurrentVendor({ ...currentVendor, password_hash: e.target.value })} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombres</label>
                  <input required type="text" value={currentVendor.nombres} onChange={e => setCurrentVendor({ ...currentVendor, nombres: e.target.value })} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Apellidos</label>
                  <input required type="text" value={currentVendor.apellidos} onChange={e => setCurrentVendor({ ...currentVendor, apellidos: e.target.value })} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                  <input required type="tel" value={currentVendor.telefono} onChange={e => setCurrentVendor({ ...currentVendor, telefono: e.target.value })} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
              </div>
              <div className="flex items-center gap-2 mb-6">
                <input type="checkbox" id="activo" checked={currentVendor.activo} onChange={e => setCurrentVendor({ ...currentVendor, activo: e.target.checked })} className="w-4 h-4 text-teal-600 rounded" />
                <label htmlFor="activo" className="text-sm font-medium text-gray-700 dark:text-gray-300">Usuario Activo</label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-[#1D9492] hover:bg-[#167876] text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                  <Save className="w-4 h-4" /> Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorsPage;