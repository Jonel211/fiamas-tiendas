// src/components/modules/Dashboard/RecentVendorsTable.jsx
import { recentVendors } from '../../../constants';
import Card from '../../ui/Card';

const RecentVendorsTable = () => {
  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-700">Últimos Tenderos Registrados</h3>
            <p className="text-xs text-gray-400">Actividad reciente en la plataforma</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Nombre</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Tienda</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Fecha de Registro</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Acción</th>
              </tr>
            </thead>
            <tbody>
              {recentVendors.map((vendor, index) => (
                <tr
                  key={vendor.id}
                  className={`border-b border-gray-100 hover:bg-indigo-50/50 transition-colors duration-200 group ${
                    index === 0 ? 'border-l-4 border-l-indigo-500' : ''
                  }`}
                >
                  <td className="py-3 px-4 font-medium text-gray-900">{vendor.name}</td>
                  <td className="py-3 px-4 text-gray-600">{vendor.store}</td>
                  <td className="py-3 px-4 text-gray-500">{vendor.date}</td>
                  <td className="py-3 px-4 text-right">
                    <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors">
                      Ver →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};

export default RecentVendorsTable;