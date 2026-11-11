import { CheckCircle2, XCircle, Edit2, Loader2, User, Eye, Trash2, Crown } from 'lucide-react';

const VendorsTable = ({
  vendors,
  onEdit,
  onView,
  onDelete,
  onToggleStatus,
  onTogglePremium,
  actionLoadingId,
  premiumLoadingId
}) => {
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
            className="bg-white/85 dark:bg-[#1A1F2E]/80 rounded-md shadow-sm border border-white/50 dark:border-white/10 p-4 flex flex-col gap-3 backdrop-blur-sm"
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
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${vendor.activo
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
                <span className="text-gray-400 dark:text-gray-500 block">Teléfono:</span>
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

            {/* Fila Plan Premium con Switch Button */}
            <div className="flex items-center justify-between py-2 px-3 bg-gray-50/70 dark:bg-white/5 rounded-lg text-xs">
              <div className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                <Crown className={`w-3.5 h-3.5 ${vendor.es_premium ? 'text-amber-500' : 'text-gray-400'}`} />
                <span>Plan Premium:</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  role="switch"
                  aria-checked={Boolean(vendor.es_premium)}
                  disabled={premiumLoadingId === vendor.id}
                  onClick={() => onTogglePremium && onTogglePremium(vendor)}
                  title={vendor.es_premium ? 'Desactivar modo Premium' : 'Activar modo Premium'}
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500/40 disabled:opacity-50 disabled:cursor-not-allowed ${vendor.es_premium ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                >
                  <span
                    className={`pointer-events-none flex items-center justify-center h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${vendor.es_premium ? 'translate-x-4' : 'translate-x-0'
                      }`}
                  >
                    {premiumLoadingId === vendor.id ? (
                      <Loader2 className="w-2.5 h-2.5 animate-spin text-gray-500" />
                    ) : vendor.es_premium ? (
                      <Crown className="w-2.5 h-2.5 text-amber-600" />
                    ) : null}
                  </span>
                </button>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${vendor.es_premium
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                    : 'bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400'
                    }`}
                >
                  {vendor.es_premium ? 'Premium' : 'Estándar'}
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
                  className={`p-2 rounded-lg transition-colors border border-gray-200 dark:border-gray-700 ${vendor.activo
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
      <div className="hidden sm:block bg-white/85 dark:bg-[#1A1F2E]/80 rounded-md shadow-sm border border-white/50 dark:border-white/10 overflow-hidden backdrop-blur-sm transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead className="bg-gray-50/60 dark:bg-white/5 text-gray-500 dark:text-gray-400 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Nombre</th>
                <th className="px-6 py-4 font-medium">Teléfono</th>
                <th className="px-6 py-4 font-medium">DNI</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium">Plan Premium</th>
                <th className="px-6 py-4 font-medium">Creado</th>
                <th className="px-6 py-4 font-medium text-center sticky right-0 bg-gray-50/90 dark:bg-[#1A1F2E]/90 backdrop-blur-xs z-10 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)] dark:shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.3)]">
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
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={Boolean(vendor.es_premium)}
                        disabled={premiumLoadingId === vendor.id}
                        onClick={() => onTogglePremium && onTogglePremium(vendor)}
                        title={vendor.es_premium ? 'Desactivar modo Premium' : 'Activar modo Premium'}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500/40 disabled:opacity-50 disabled:cursor-not-allowed ${vendor.es_premium
                          ? 'bg-amber-500 hover:bg-amber-600 dark:bg-amber-500'
                          : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
                          }`}
                      >
                        <span
                          className={`pointer-events-none flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${vendor.es_premium ? 'translate-x-5' : 'translate-x-0'
                            }`}
                        >
                          {premiumLoadingId === vendor.id ? (
                            <Loader2 className="w-3 h-3 animate-spin text-gray-500" />
                          ) : vendor.es_premium ? (
                            <Crown className="w-3 h-3 text-amber-600" />
                          ) : null}
                        </span>
                      </button>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${vendor.es_premium
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400'
                          }`}
                      >
                        {vendor.es_premium ? 'Premium' : 'Estándar'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[14px] leading-[20px] font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    <div>{formatDate(vendor.creado_en || vendor.createdAt)}</div>
                  </td>
                  <td className="px-6 py-4 sticky right-0 bg-white/90 dark:bg-[#1A1F2E]/90 backdrop-blur-xs group-hover:bg-white dark:group-hover:bg-[#202738] z-10 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)] dark:shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.3)] transition-colors">
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