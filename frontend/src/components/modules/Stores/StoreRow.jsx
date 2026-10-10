// src/components/modules/Stores/StoreRow.jsx
import Badge from '../../ui/Badge';
import { Edit, Trash2, Eye } from 'lucide-react';

const StoreRow = ({ store }) => {
  const statusVariant = {
    activo: 'success',
    inactivo: 'danger',
    pendiente: 'warning',
  }[store.status] || 'default';

  return (
    <tr className="border-b border-gray-100 hover:bg-brand-50/50 transition-colors group relative">
      <td className="py-3 text-sm font-medium text-gray-800 relative">
        <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        {store.id}
      </td>
      <td className="py-3 text-sm text-gray-800">{store.name}</td>
      <td className="py-3 text-sm text-gray-600">{store.address}</td>
      <td className="py-3 text-sm text-gray-600">{store.ruc}</td>
      <td className="py-3">
        <Badge variant={statusVariant}>{store.status}</Badge>
      </td>
      <td className="py-3 text-sm text-gray-500">{store.createdAt}</td>
      <td className="py-3">
        <div className="flex items-center gap-2">
          <button className="text-gray-400 hover:text-brand-600 transition-colors" title="Ver">
            <Eye className="w-4 h-4" />
          </button>
          <button className="text-gray-400 hover:text-blue-600 transition-colors" title="Editar">
            <Edit className="w-4 h-4" />
          </button>
          <button className="text-gray-400 hover:text-red-600 transition-colors" title="Eliminar">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};
export default StoreRow;