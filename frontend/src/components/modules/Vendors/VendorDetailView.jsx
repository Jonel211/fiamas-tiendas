import {
  ArrowLeft,
  User,
  Phone,
  FileText,
  Calendar,
  Store,
  Edit2,
  Trash2,
  Power,
  ShieldCheck,
  ShieldAlert,
  Clock
} from 'lucide-react';

const VendorDetailView = ({
  vendor,
  onBack,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  if (!vendor) return null;

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

  const nombreCompleto = `${vendor.nombres} ${vendor.apellidos}`.trim();

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
          <span>Volver al listado de tenderos</span>
        </button>

        <div className="flex items-center flex-wrap gap-2">
          {onToggleStatus && (
            <button
              type="button"
              onClick={() => onToggleStatus(vendor)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${vendor.activo
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:text-emerald-400'
                  : 'border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-800/60 dark:bg-rose-950/30 dark:text-rose-400'
                }`}
              title={vendor.activo ? 'Desactivar tendero' : 'Activar tendero'}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{vendor.activo ? 'Tendero Activo' : 'Tendero Inactivo'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onEdit(vendor)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1D9492] hover:bg-[#167876] text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Editar</span>
          </button>

          <button
            type="button"
            onClick={() => onDelete(vendor)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-rose-300 dark:border-rose-800/60 bg-white dark:bg-transparent text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-medium rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Eliminar</span>
          </button>
        </div>
      </div>

      {/* Tarjeta Principal de Presentación */}
      <div className="bg-white dark:bg-[#1A1F2E] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-shrink-0 flex items-center justify-center overflow-hidden">
            {vendor.foto_perfil_url ? (
              <img
                src={vendor.foto_perfil_url}
                alt={nombreCompleto}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-slate-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                {nombreCompleto}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium border inline-flex items-center gap-1 ${vendor.activo
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                    : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800'
                  }`}
              >
                {vendor.activo ? (
                  <>
                    <ShieldCheck className="w-3 h-3" />
                    <span>Activo</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-3 h-3" />
                    <span>Inactivo</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Secciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sección: Datos Personales */}
        <div className="bg-white dark:bg-[#1A1F2E] rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <User className="w-4 h-4 text-[#1D9492]" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Datos del Tendero
            </h2>
          </div>

          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-500 block mb-0.5">Nombres</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{vendor.nombres}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block mb-0.5">Apellidos</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{vendor.apellidos}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-500 block mb-0.5 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> DNI
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {vendor.dni || 'No registrado'}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block mb-0.5 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> Teléfono
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {vendor.telefono || 'No registrado'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sección: Historial y Registro */}
        <div className="bg-white dark:bg-[#1A1F2E] rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
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
                  {formatDate(vendor.creado_en || vendor.createdAt)}
                </span>
              </div>
            </div>

            {vendor.actualizado_en && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div>
                  <span className="text-xs text-slate-500 block">Última Actualización</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {formatDate(vendor.actualizado_en || vendor.updatedAt)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sección: Tiendas a su Cargo (Full width) */}
        <div className="md:col-span-2 bg-white dark:bg-[#1A1F2E] rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-[#1D9492]" />
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Tiendas a su Cargo ({vendor.tiendas ? vendor.tiendas.length : 0})
              </h2>
            </div>
          </div>

          {vendor.tiendas && vendor.tiendas.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {vendor.tiendas.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col justify-between gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                      {t.nombre}
                    </span>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-medium border flex-shrink-0 ${t.activo
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                          : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800'
                        }`}
                    >
                      {t.activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 space-y-0.5">
                    <div>RUC: <strong className="text-slate-700 dark:text-slate-300">{t.ruc || 'Sin RUC'}</strong></div>
                    {t.direccion && <div className="truncate"><span className="text-slate-600 dark:text-slate-400 font-medium">Dirección:</span> {t.direccion}</div>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
              Este tendero no tiene ninguna tienda asignada actualmente.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorDetailView;
