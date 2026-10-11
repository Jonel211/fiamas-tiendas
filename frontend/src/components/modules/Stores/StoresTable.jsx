// src/components/modules/Stores/StoresTable.jsx
import StoreRow from './StoreRow';

const storesData = [
  { id: 'FT-1042', name: 'Bodega Don Pepe', address: 'Av. Los Próceres 124', ruc: '20123456789', status: 'activo', createdAt: '12 Jun, 2024' },
  { id: 'FT-1041', name: 'Mercado Central', address: 'Jr. Huallaga 482', ruc: '20456789123', status: 'activo', createdAt: '09 Jun, 2024' },
  { id: 'FT-1040', name: 'Minimarket El Sol', address: 'Calle Lima 208', ruc: '20678912345', status: 'pendiente', createdAt: '06 Jun, 2024' },
  { id: 'FT-1039', name: 'Abarrotes La Esquina', address: 'Av. Arequipa 931', ruc: '20112233445', status: 'activo', createdAt: '02 Jun, 2024' },
  { id: 'FT-1038', name: 'Tienda San Martin', address: 'Jr. Tacna 116', ruc: '20556677889', status: 'inactivo', createdAt: '28 May, 2024' },
];

const StoresTable = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">ID</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Nombre</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Dirección</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">RUC</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Estado</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Fecha</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {storesData.map((store) => (
              <StoreRow key={store.id} store={store} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default StoresTable;