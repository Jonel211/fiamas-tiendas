import { Power, QrCode, RefreshCw, Edit2, Store, Loader2, Eye, Trash2 } from 'lucide-react';

const StoreCard = ({
  store,
  onToggleActivo,
  onToggleQR,
  onRegenerarQR,
  onEdit,
  onDelete,
  onViewDetails,
  actionLoadingId
}) => {
  const tenderoNombre = store.tendero
    ? `${store.tendero.nombres} ${store.tendero.apellidos}`
    : 'Sin tendero asignado';

  return (
    <div className="bg-white dark:bg-[#1A1F2E] rounded-xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col hover:border-teal-500/30 transition-all">
      <div className="p-5 flex items-start gap-4">
        {/* Foto de la tienda con hover interactivo para ver más detalle */}
        <div
          onClick={() => onViewDetails && onViewDetails(store)}
          title="Clic para ver más detalle"
          className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0 overflow-hidden flex items-center justify-center border border-gray-200/50 dark:border-gray-700 relative group/img cursor-pointer shadow-xs"
        >
          {store.imagen_url ? (
            <img
              src={store.imagen_url}
              alt={store.nombre}
              className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-300"
            />
          ) : (
            <Store className="w-8 h-8 text-gray-400 group-hover/img:scale-110 transition-transform duration-300" />
          )}

          {/* Overlay al pasar el mouse por encima */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white">
            <Eye className="w-4 h-4 animate-in zoom-in-75 duration-150" />
            <span className="text-[9px] font-semibold tracking-wide uppercase mt-0.5">Ver</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3
            onClick={() => onViewDetails && onViewDetails(store)}
            className="font-bold text-gray-900 dark:text-white truncate text-base cursor-pointer hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            title={store.nombre}
          >
            {store.nombre}
          </h3>
          <p className="text-xs text-gray-500 truncate mt-0.5">
            RUC: <span className="font-medium text-gray-700 dark:text-gray-300">{store.ruc || 'No registrado'}</span>
          </p>
          <p className="text-xs text-gray-500 truncate">
            Tel: <span className="font-medium text-gray-700 dark:text-gray-300">{store.telefono || 'Sin teléfono'}</span>
          </p>
          <p className="text-xs text-teal-600 dark:text-teal-400 truncate mt-1.5 font-medium" title={tenderoNombre}>
            Resp: {tenderoNombre}
          </p>
        </div>
      </div>

      {store.direccion && (
        <div className="px-5 pb-3 text-xs text-gray-500 dark:text-gray-400 truncate">
          <span className="font-medium text-gray-700 dark:text-gray-300">Dirección:</span> {store.direccion}
        </div>
      )}

      <div className="px-5 py-3 border-t border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-gray-800/30 flex justify-between items-center gap-2 flex-wrap mt-auto">
        <div className="flex gap-4">
          {/* Botón Activo/Inactivo */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider mb-1">Tienda</span>
            <button
              onClick={() => onToggleActivo(store)}
              disabled={actionLoadingId === `activo-${store.id}`}
              className={`p-1.5 rounded-md transition-colors ${
                store.activo
                  ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-400'
                  : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-400'
              }`}
              title={store.activo ? 'Deshabilitar Tienda' : 'Habilitar Tienda'}
            >
              {actionLoadingId === `activo-${store.id}` ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Power className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Botón QR */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider mb-1">Token QR</span>
            <button
              onClick={() => onToggleQR(store)}
              disabled={actionLoadingId === `qr-${store.id}`}
              className={`p-1.5 rounded-md transition-colors ${
                store.qr_activo
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-400'
                  : 'bg-gray-200 text-gray-500 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-400'
              }`}
              title={store.qr_activo ? 'Desactivar QR' : 'Activar QR'}
            >
              {actionLoadingId === `qr-${store.id}` ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <QrCode className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onRegenerarQR(store)}
            disabled={actionLoadingId === `regen-${store.id}`}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            title="Regenerar Token QR"
          >
            {actionLoadingId === `regen-${store.id}` ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => onEdit(store)}
            className="p-2 text-gray-400 hover:text-teal-600 transition-colors"
            title="Editar Tienda"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete && onDelete(store)}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="Eliminar Tienda"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoreCard;
