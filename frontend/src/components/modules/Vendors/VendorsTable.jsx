// src/components/modules/Vendors/VendorsTable.jsx
import VendorRow from './VendorRow';

const vendorsData = [
  { id: 'VEN-001', name: 'María González', dni: '12345678', phone: '987654321', store: 'Bodega Don Pepe', status: 'activo', createdAt: '18 Jun, 2024' },
  { id: 'VEN-002', name: 'Carlos Mendoza', dni: '87654321', phone: '987123456', store: 'Mercado Central', status: 'activo', createdAt: '17 Jun, 2024' },
  { id: 'VEN-003', name: 'Ana Torres', dni: '45678912', phone: '998877665', store: 'Minimarket El Sol', status: 'inactivo', createdAt: '16 Jun, 2024' },
  { id: 'VEN-004', name: 'Luis Ramírez', dni: '78912345', phone: '966554433', store: 'Abarrotes La Esquina', status: 'activo', createdAt: '15 Jun, 2024' },
];

const VendorsTable = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">ID</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Nombre</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">DNI</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Teléfono</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Tienda</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Estado</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Fecha</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {vendorsData.map((vendor) => (
              <VendorRow key={vendor.id} vendor={vendor} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default VendorsTable;