import { CheckCircle2, XCircle, Edit2, Loader2, User, Eye, Trash2 } from 'lucide-react';

const VendorsTable = ({ vendors, onEdit, onView, onDelete, onToggleStatus, actionLoadingId }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const d = new Date(dateString);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-4">
      {/* Vista Móvil: Tarjetas individuales para pantallas pequeñas (sm:hidden) */}
      <div className="grid grid-cols-1 gap-3.5 sm:hidden">
        {vendors.map((vendor) => (
          <div
            key={vendor.id}
            className="bg-white dark:bg-[#1A1F2E] rounded-xl shadow-sm border border-gray-100 dark:border-white/5 p-4 flex flex-col gap-3"
          >
            {/* Header de la tarjeta */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {vendor.foto_perfil_url ? (
                    <img
                      src={vendor.foto_perfil_url}
                      alt={vendor.nombres}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                    {vendor.nombres} {vendor.apellidos}
                  </h4>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    DNI: {vendor.dni || '-'}
                  </span>
                </div>
              </div>

              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                  vendor.activo
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}
              >
                {vendor.activo ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                {vendor.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            {/* Datos: Teléfono y Creado */}
            <div className="grid grid-cols-2 gap-2 py-2 px-3 bg-gray-50/70 dark:bg-white/5 rounded-lg text-xs">
              <div>
                <span className="text-gray-400 dark:text-gray-500 block">Contacto:</span>
                <span className="font-medium text-gray-800 dark:text-gray-200 truncate block">
                  {vendor.telefono || '-'}
                </span>
              </div>
              <div>
                <span className="text-gray-400 dark:text-gray-500 block">Creado:</span>
                <span className="text-[14px] leading-[20px] font-medium text-gray-500 dark:text-gray-400 block">
                  {formatDate(vendor.creado_en || vendor.createdAt)}
                </span>
              </div>
            </div>

            {/* Acciones visibles en móvil */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/5">
              <span className="text-xs font-medium text-gray-400">Acciones:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onView && onView(vendor)}
                  className="p-2 text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
                  title="Ver detalle del tendero"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onEdit(vendor)}
                  className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
                  title="Editar tendero"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onToggleStatus(vendor)}
                  disabled={actionLoadingId === vendor.id}
                  className={`p-2 rounded-lg transition-colors border border-gray-200 dark:border-gray-700 ${
                    vendor.activo
                      ? 'text-amber-500 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                      : 'text-green-500 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20'
                  }`}
                  title={vendor.activo ? 'Deshabilitar tendero' : 'Habilitar tendero'}
                >
                  {actionLoadingId === vendor.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : vendor.activo ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => onDelete && onDelete(vendor)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
                  title="Eliminar tendero"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Vista Desktop / Tablet (hidden sm:block): Tabla con Acciones sticky y min-w */}
      <div className="hidden sm:block bg-white dark:bg-[#1A1F2E] rounded-xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Nombre</th>
                <th className="px-6 py-4 font-medium">Contacto</th>
                <th className="px-6 py-4 font-medium">DNI</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium">Creado</th>
                <th className="px-6 py-4 font-medium text-center sticky right-0 bg-gray-50 dark:bg-[#1E2538] z-10 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)] dark:shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.3)]">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-sm">
              {vendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {vendor.foto_perfil_url ? (
                          <img
                            src={vendor.foto_perfil_url}
                            alt={`${vendor.nombres}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {vendor.nombres} {vendor.apellidos}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900 dark:text-gray-300 font-medium">
                      {vendor.telefono || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900 dark:text-gray-300">
                      {vendor.dni || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${vendor.activo
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                    >
                      {vendor.activo ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {vendor.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[14px] leading-[20px] font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    <div>{formatDate(vendor.creado_en || vendor.createdAt)}</div>
                  </td>
                  <td className="px-6 py-4 sticky right-0 bg-white dark:bg-[#1A1F2E] group-hover:bg-gray-50 dark:group-hover:bg-[#202738] z-10 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)] dark:shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.3)] transition-colors">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Ver Detalle */}
                      <button
                        onClick={() => onView && onView(vendor)}
                        className="p-1.5 text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-md transition-colors"
                        title="Ver detalle del tendero"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Editar */}
                      <button
                        onClick={() => onEdit(vendor)}
                        className="p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                        title="Editar tendero"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Activar/Desactivar */}
                      <button
                        onClick={() => onToggleStatus(vendor)}
                        disabled={actionLoadingId === vendor.id}
                        className={`p-1.5 rounded-md transition-colors ${vendor.activo
                            ? 'text-amber-500 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                            : 'text-green-500 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20'
                          }`}
                        title={vendor.activo ? 'Deshabilitar tendero' : 'Habilitar tendero'}
                      >
                        {actionLoadingId === vendor.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : vendor.activo ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                      </button>

                      {/* Eliminar Tendero */}
                      <button
                        onClick={() => onDelete && onDelete(vendor)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        title="Eliminar tendero"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VendorsTable;