import { useState } from 'react';
import {
  ArrowLeft,
  Store,
  User,
  Phone,
  MapPin,
  FileText,
  QrCode,
  Calendar,
  Check,
  Copy,
  Edit2,
  Trash2,
  Power,
  RefreshCw,
  Clock
} from 'lucide-react';

const StoreDetailView = ({
  store,
  onBack,
  onEdit,
  onDelete,
  onToggleActivo,
  onToggleQR,
  onRegenerarQR,
}) => {
  const [copied, setCopied] = useState(false);

  if (!store) return null;

  const handleCopyQR = () => {
    if (store.qr_token) {
      navigator.clipboard.writeText(store.qr_token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    try {
      return new Date(dateString).toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const tenderoNombre = store.tendero
    ? `${store.tendero.nombres} ${store.tendero.apellidos}`
    : 'Sin tendero asignado';

  return (
    <div className="space-y-6 animate-fade-soft">
      {/* Barra Superior de Navegación y Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors group w-fit"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Volver al listado de tiendas</span>
        </button>

        <div className="flex items-center flex-wrap gap-2">
          {onToggleActivo && (
            <button
              type="button"
              onClick={() => onToggleActivo(store)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${store.activo
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:text-emerald-400'
                  : 'border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-800/60 dark:bg-rose-950/30 dark:text-rose-400'
                }`}
              title={store.activo ? 'Desactivar tienda' : 'Activar tienda'}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{store.activo ? 'Tienda Activa' : 'Tienda Inactiva'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onEdit(store)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1D9492] hover:bg-[#167876] text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Editar</span>
          </button>

          <button
            type="button"
            onClick={() => onDelete(store)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-rose-300 dark:border-rose-800/60 bg-white dark:bg-transparent text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-medium rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Eliminar</span>
          </button>
        </div>
      </div>

      {/* Tarjeta Principal de Presentación */}
      <div className="bg-white/85 dark:bg-[#1A1F2E]/80 rounded-md border border-white/50 dark:border-white/10 p-6 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-shrink-0 flex items-center justify-center overflow-hidden">
            {store.imagen_url ? (
              <img
                src={store.imagen_url}
                alt={store.nombre}
                className="w-full h-full object-cover"
              />
            ) : (
              <Store className="w-9 h-9 text-slate-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                {store.nombre}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${store.activo
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                    : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800'
                  }`}
              >
                {store.activo ? 'Activa' : 'Inactiva'}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${store.qr_activo
                    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800'
                    : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                  }`}
              >
                {store.qr_activo ? 'QR Habilitado' : 'QR Deshabilitado'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Secciones de Información */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sección: Información Comercial */}
        <div className="bg-white/85 dark:bg-[#1A1F2E]/80 rounded-md border border-white/50 dark:border-white/10 p-5 shadow-sm space-y-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Store className="w-4 h-4 text-[#1D9492]" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Información de la Tienda
            </h2>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-slate-500 block mb-0.5">Nombre Comercial</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{store.nombre}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-500 block mb-0.5 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> RUC
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {store.ruc || 'No registrado'}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block mb-0.5 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> Teléfono
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {store.telefono || 'No registrado'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-500 block mb-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Dirección
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {store.direccion || 'Sin dirección registrada'}
              </span>
            </div>
          </div>
        </div>

        {/* Sección: Tendero Responsable */}
        <div className="bg-white/85 dark:bg-[#1A1F2E]/80 rounded-md border border-white/50 dark:border-white/10 p-5 shadow-sm space-y-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <User className="w-4 h-4 text-[#1D9492]" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Tendero Responsable
            </h2>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3">
            <div>
              <span className="text-xs text-slate-500 block">Nombre del Tendero</span>
              <span className="font-semibold text-slate-900 dark:text-white text-base">
                {tenderoNombre}
              </span>
            </div>

            {store.tendero && (
              <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <div>
                  <span className="text-slate-500 block">DNI</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {store.tendero.dni || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Teléfono de Contacto</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {store.tendero.telefono || '-'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sección: Vinculación y Token QR */}
        <div className="bg-white/85 dark:bg-[#1A1F2E]/80 rounded-md border border-white/50 dark:border-white/10 p-5 shadow-sm space-y-4 backdrop-blur-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-[#1D9492]" />
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Token QR de Vinculación
              </h2>
            </div>
            {onToggleQR && (
              <button
                type="button"
                onClick={() => onToggleQR(store)}
                className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-[#1D9492] dark:hover:text-[#1D9492] transition-colors"
              >
                {store.qr_activo ? 'Desactivar QR' : 'Activar QR'}
              </button>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              Este token permite que los clientes escaneen y se vinculen a esta tienda desde su aplicación móvil.
            </p>

            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
              <code className="text-xs font-mono text-slate-700 dark:text-slate-300 flex-1 truncate">
                {store.qr_token || 'Sin token generado'}
              </code>
              {store.qr_token && (
                <button
                  type="button"
                  onClick={handleCopyQR}
                  title="Copiar token"
                  className="px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-[#1D9492] hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
              )}
            </div>

            {onRegenerarQR && (
              <button
                type="button"
                onClick={() => onRegenerarQR(store)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1D9492] hover:text-[#167876] transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Regenerar nuevo token QR</span>
              </button>
            )}
          </div>
        </div>

        {/* Sección: Fechas y Registro */}
        <div className="bg-white/85 dark:bg-[#1A1F2E]/80 rounded-md border border-white/50 dark:border-white/10 p-5 shadow-sm space-y-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Calendar className="w-4 h-4 text-[#1D9492]" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Historial y Registro
            </h2>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
              <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div>
                <span className="text-xs text-slate-500 block">Fecha de Registro</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {formatDate(store.creado_en || store.createdAt)}
                </span>
              </div>
            </div>

            {store.actualizado_en && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div>
                  <span className="text-xs text-slate-500 block">Última Actualización</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {formatDate(store.actualizado_en || store.updatedAt)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreDetailView;
