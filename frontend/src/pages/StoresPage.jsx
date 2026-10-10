import { useState } from 'react';
import { Plus, Edit2, QrCode, Power, X, Save, Store } from 'lucide-react';
import iconTiendas from '@/assets/icons/sidebar/tiendas.png';

const initialStores = [
  { id: 1, nombre_comercial: 'Bodega El Sol', direccion: 'Av. Principal 123', ruc: '20123456789', telefono: '01 4567890', imagen_url: 'https://via.placeholder.com/150', tendero_id: 1, tendero_nombre: 'Juan Carlos Pérez', activo: true, qr_activo: true },
  { id: 2, nombre_comercial: 'Minimarket Los Pinos', direccion: 'Jr. Los Álamos 456', ruc: '20987654321', telefono: '01 9876543', imagen_url: 'https://via.placeholder.com/150', tendero_id: 2, tendero_nombre: 'Ana María Gómez', activo: false, qr_activo: false },
];

const StoresPage = () => {
  const [stores, setStores] = useState(initialStores);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStore, setCurrentStore] = useState(null);

  const openModal = (store = null) => {
    setCurrentStore(store || { nombre_comercial: '', direccion: '', ruc: '', telefono: '', imagen_url: '', tendero_id: '', activo: true, qr_activo: true });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentStore(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentStore.id) {
      setStores(stores.map(s => s.id === currentStore.id ? currentStore : s));
    } else {
      setStores([...stores, { ...currentStore, id: Date.now(), tendero_nombre: 'Asignado (ID: ' + currentStore.tendero_id + ')' }]);
    }
    closeModal();
  };

  const toggleField = (id, field) => {
    setStores(stores.map(s => s.id === id ? { ...s, [field]: !s[field] } : s));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/20 rounded-xl flex items-center justify-center">
            <img src={iconTiendas} alt="" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Gestión de Tiendas</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Administra las tiendas y sus códigos QR vinculados.</p>
          </div>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-[#1D9492] hover:bg-[#167876] text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Nueva Tienda
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-white dark:bg-[#1A1F2E] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
        <div className="flex-1 relative">
          <input 
            type="text" 
            placeholder="Buscar por nombre, RUC o responsable..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#242B3D] border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9492] dark:text-white transition-all"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select className="px-4 py-2 bg-gray-50 dark:bg-[#242B3D] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1D9492] cursor-pointer">
          <option value="all">Todas las tiendas</option>
          <option value="active">Activas</option>
          <option value="inactive">Inactivas</option>
        </select>
        <select className="px-4 py-2 bg-gray-50 dark:bg-[#242B3D] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1D9492] cursor-pointer">
          <option value="all">Cualquier estado QR</option>
          <option value="qr_active">QR Activo</option>
          <option value="qr_inactive">QR Inactivo</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map(store => (
          <div key={store.id} className="bg-white dark:bg-[#1A1F2E] rounded-xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col">
            <div className="p-5 flex items-start gap-4">
              <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                {store.imagen_url ? (
                  <img src={store.imagen_url} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-full h-full p-4 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 dark:text-white truncate">{store.nombre_comercial}</h3>
                <p className="text-sm text-gray-500 truncate">RUC: {store.ruc}</p>
                <p className="text-sm text-teal-600 dark:text-teal-400 truncate mt-1">Resp: {store.tendero_nombre}</p>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-gray-800/30 flex justify-between items-center mt-auto">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider mb-1">Tienda</span>
                  <button onClick={() => toggleField(store.id, 'activo')} className={`p-1.5 rounded-md transition-colors ${store.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`} title={store.activo ? 'Deshabilitar Tienda' : 'Habilitar Tienda'}>
                    <Power className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider mb-1">Token QR</span>
                  <button onClick={() => toggleField(store.id, 'qr_activo')} className={`p-1.5 rounded-md transition-colors ${store.qr_activo ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'}`} title={store.qr_activo ? 'Deshabilitar QR' : 'Habilitar QR'}>
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <button onClick={() => openModal(store)} className="p-2 text-gray-400 hover:text-teal-600 transition-colors">
                <Edit2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1A1F2E] rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">{currentStore.id ? 'Editar Tienda' : 'Nueva Tienda'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre Comercial</label>
                  <input required type="text" value={currentStore.nombre_comercial} onChange={e => setCurrentStore({ ...currentStore, nombre_comercial: e.target.value })} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">RUC</label>
                  <input required type="text" value={currentStore.ruc} onChange={e => setCurrentStore({ ...currentStore, ruc: e.target.value })} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dirección</label>
                  <input required type="text" value={currentStore.direccion} onChange={e => setCurrentStore({ ...currentStore, direccion: e.target.value })} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                  <input required type="tel" value={currentStore.telefono} onChange={e => setCurrentStore({ ...currentStore, telefono: e.target.value })} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ID Responsable (Tendero)</label>
                  <input required type="number" value={currentStore.tendero_id} onChange={e => setCurrentStore({ ...currentStore, tendero_id: e.target.value })} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL del Logo (imagen_url)</label>
                  <input type="url" value={currentStore.imagen_url} onChange={e => setCurrentStore({ ...currentStore, imagen_url: e.target.value })} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" placeholder="https://..." />
                </div>
              </div>
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="store_activo" checked={currentStore.activo} onChange={e => setCurrentStore({ ...currentStore, activo: e.target.checked })} className="w-4 h-4 text-teal-600 rounded" />
                  <label htmlFor="store_activo" className="text-sm font-medium text-gray-700 dark:text-gray-300">Tienda Activa</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="qr_activo" checked={currentStore.qr_activo} onChange={e => setCurrentStore({ ...currentStore, qr_activo: e.target.checked })} className="w-4 h-4 text-teal-600 rounded" />
                  <label htmlFor="qr_activo" className="text-sm font-medium text-gray-700 dark:text-gray-300">Token QR Activo</label>
                </div>
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

export default StoresPage;