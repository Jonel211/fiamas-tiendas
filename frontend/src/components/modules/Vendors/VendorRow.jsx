// src/components/modules/Vendors/VendorRow.jsx
import Badge from '../../ui/Badge';
import { Edit, Trash2, Eye } from 'lucide-react';

const VendorRow = ({ vendor }) => {
  const statusVariant = {
    activo: 'success',
    inactivo: 'danger',
  }[vendor.status] || 'default';

  return (
    <tr className="border-b border-gray-100 hover:bg-brand-50/50 transition-colors group relative">
      <td className="py-3 text-sm font-medium text-gray-800 relative">
        <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        {vendor.id}
      </td>
      <td className="py-3 text-sm text-gray-800">{vendor.name}</td>
      <td className="py-3 text-sm text-gray-600">{vendor.dni}</td>
      <td className="py-3 text-sm text-gray-600">{vendor.phone}</td>
      <td className="py-3 text-sm text-gray-600">{vendor.store}</td>
      <td className="py-3">
        <Badge variant={statusVariant}>{vendor.status}</Badge>
      </td>
      <td className="py-3 text-sm text-gray-500">{vendor.createdAt}</td>
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
export default VendorRow;