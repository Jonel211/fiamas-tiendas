import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  LifeBuoy,
  Search,
  RefreshCw,
  Clock,
  AlertTriangle,
  Bell,
  MessageCircle,
  Phone,
  User,
  Trash2,
  ExternalLink,
  Store,
  X,
  Loader
} from 'lucide-react';
import iconSupport from '@/assets/icons/sidebar/support.png';
import { getAvisos, eliminarAviso } from '../services/avisoService';
import { useToast } from '../context/ToastContext';

const priorityConfig = {
  urgente: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-600 dark:text-red-400',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    icon: AlertTriangle
  },
  alta: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-600 dark:text-red-400',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    icon: AlertTriangle
  },
  media: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-600 dark:text-yellow-400',
    badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
    icon: Bell
  },
  baja: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    icon: MessageCircle
  }
};

const getSafeString = (val, fallback = '') => {
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (val && typeof val === 'object') {
    if (typeof val.label === 'string') return val.label;
    if (typeof val.nombre === 'string') return val.nombre;
    if (typeof val.nombres === 'string') return `${val.nombres} ${val.apellidos || ''}`.trim();
  }
  return fallback;
};

// Modal de detalle del mensaje de soporte
const SupportDetailModal = ({ mensaje, onClose, onDelete }) => {
  if (!mensaje) return null;

  const tendero = mensaje.emisorTendero || (typeof mensaje.emisor === 'object' ? mensaje.emisor?.tendero : null);
  const rawNombre = tendero ? `${tendero.nombres || ''} ${tendero.apellidos || ''}`.trim() : mensaje.destinatario;
  const nombreTendero = getSafeString(rawNombre, 'Tendero');
  const telefono = tendero?.telefono ? getSafeString(tendero.telefono) : '';
  const telefonoLimpio = telefono.replace(/\D/g, '');
  const waUrl = telefonoLimpio
    ? `https://wa.me/51${telefonoLimpio}?text=Hola%20${encodeURIComponent(tendero?.nombres || 'Tendero')},%20me%20comunico%20desde%20Soporte%20Fiamas%20respecto%20a%20su%20mensaje:%20"${encodeURIComponent(getSafeString(mensaje.titulo, 'Consulta'))}"`
    : null;

  const cfg = priorityConfig[mensaje.priority] || priorityConfig.media;
  const PIcon = cfg.icon;

  return createPortal(
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      style={{ top: 0, left: 0, right: 0, bottom: 0, margin: 0 }}
    >
      <div
        className="bg-white dark:bg-[#1A1F2E] rounded-xl shadow-2xl w-full max-w-xl border border-gray-100 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del modal */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-white dark:bg-[#1A1F2E]">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${cfg.bg} flex items-center justify-center ${cfg.text}`}>
              <PIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 dark:text-white text-base">
                Mensaje de Soporte
              </h3>
              <p className="text-xs text-gray-400">
                {mensaje.date || 'Recibido recientemente'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Tarjeta del Tendero */}
          <div className="p-4 rounded-lg bg-gray-50/80 dark:bg-[#0F1420]/80 border border-gray-200/60 dark:border-white/5 space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#1D9492]/10 text-[#1D9492] font-bold flex items-center justify-center text-sm">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800 dark:text-white">
                    {nombreTendero}
                  </h4>
                  <p className="text-xs text-gray-400">
                    {tendero?.dni ? `DNI: ${tendero.dni}` : 'Tendero de la red Fiamas'}
                  </p>
                </div>
              </div>

              {/* Botones directos de contacto */}
              {telefono && (
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${telefonoLimpio}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#1D9492]" /> {telefono}
                  </a>
                  {waUrl && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                    </a>
                  )}
                </div>
              )}
            </div>

            {tendero?.email && (
              <p className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200/40 dark:border-white/5">
                Correo: <span className="text-gray-700 dark:text-gray-300 font-medium">{tendero.email}</span>
              </p>
            )}
          </div>

          {/* Asunto y Detalle */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Asunto / Solicitud
              </span>
              <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${cfg.badge}`}>
                {mensaje.priority}
              </span>
            </div>
            <h4 className="font-bold text-gray-800 dark:text-white text-base">
              {mensaje.titulo || 'Sin asunto'}
            </h4>
          </div>

          <div className="p-4 rounded-lg bg-gray-50 dark:bg-[#0F1420] border border-gray-100 dark:border-white/5">
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
              {mensaje.message || 'Sin contenido especificado.'}
            </p>
          </div>
        </div>

        {/* Footer del Modal */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between bg-white dark:bg-[#1A1F2E]">
          <button
            type="button"
            onClick={() => {
              onClose();
              onDelete(mensaje);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Eliminar Mensaje
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-md transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// Modal de confirmación para eliminar mensaje de soporte
const ConfirmDeleteSupportModal = ({ mensaje, onClose, onConfirm, deleting }) => {
  if (!mensaje) return null;

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !deleting) onClose();
      }}
      className="fixed inset-0 z-[9999] w-screen h-screen flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      style={{ top: 0, left: 0, right: 0, bottom: 0, margin: 0 }}
    >
      <div
        className="bg-white dark:bg-[#1A1F2E] rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-100 dark:border-white/10 text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center mb-3.5">
          <Trash2 className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1.5">
          ¿Eliminar este mensaje de soporte?
        </h3>

        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Esta acción removerá el mensaje de la bandeja de soporte del panel de administración.
        </p>

        <div className="bg-gray-50 dark:bg-[#0F1420] rounded-lg p-3.5 border border-gray-100 dark:border-white/5 mb-5 text-left">
          <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
            {mensaje.titulo || 'Sin título'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
            {mensaje.message}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-lg font-semibold text-gray-700 dark:text-slate-200 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 transition-colors text-sm disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {deleting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" /> Eliminando...
              </>
            ) : (
              'Sí, eliminar'
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default function SupportPage() {
  const toast = useToast();
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buscar, setBuscar] = useState('');
  const [prioridad, setPrioridad] = useState('todos');
  const [selectedMensaje, setSelectedMensaje] = useState(null);
  const [mensajeToDelete, setMensajeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadMensajes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAvisos({ buscar, prioridad });
      const todos = data?.avisos || [];
      // Filtrar para mostrar únicamente los mensajes que envía el tendero (ayuda_soporte)
      const filtrados = todos.filter(
        (a) => a.emisor_tipo === 'tendero' || a.tipo_alerta === 'ayuda_soporte'
      );
      setMensajes(filtrados);
    } catch (err) {
      console.error(err);
      if (toast?.error) toast.error('Error al cargar mensajes de soporte');
    } finally {
      setLoading(false);
    }
  }, [buscar, prioridad, toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMensajes();
    }, buscar ? 350 : 0);
    return () => clearTimeout(timer);
  }, [loadMensajes, buscar]);

  const handleConfirmDelete = async () => {
    if (!mensajeToDelete) return;
    try {
      setDeleting(true);
      await eliminarAviso(mensajeToDelete.id);
      if (toast?.success) toast.success('Mensaje de soporte eliminado con éxito');
      setMensajeToDelete(null);
      await loadMensajes();
    } catch (err) {
      if (toast?.error) toast.error(err.message || 'Error al eliminar el mensaje');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado con estilo idéntico al de Avisos */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <img
            src={iconSupport}
            alt="Soporte"
            className="w-9 h-9 sm:w-10 sm:h-10 object-contain flex-shrink-0"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Soporte y Mensajes
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Consultas, dudas y solicitudes de asistencia enviadas por los tenderos.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadMensajes}
            title="Actualizar"
            className="p-2 rounded-md border border-white/50 dark:border-white/10 bg-white/85 dark:bg-[#1A1F2E]/80 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Bandeja de Mensajes con fondo transparente estilo Avisos */}
      <div className="bg-white/85 dark:bg-[#1A1F2E]/80 rounded-md shadow-sm border border-white/50 dark:border-white/10 overflow-hidden backdrop-blur-sm transition-colors">
        {/* Barra de filtros */}
        <div className="p-4 border-b border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              placeholder="Buscar por título, mensaje o tendero..."
              className="w-full pl-9 pr-4 py-2 rounded-md border border-white/50 dark:border-white/10 bg-white/85 dark:bg-[#0F1420]/80 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9492]/30 focus:border-[#1D9492] text-gray-900 dark:text-white transition-all shadow-sm backdrop-blur-sm"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['todos', 'urgente', 'alta', 'media', 'baja'].map((p) => (
              <button
                key={p}
                onClick={() => setPrioridad(p)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors capitalize ${prioridad === p
                    ? 'bg-[#1D9492] text-white shadow-sm'
                    : 'bg-white/85 dark:bg-white/5 border border-white/50 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 shadow-sm'
                  }`}
              >
                {p === 'todos' ? 'Todos' : `Prioridad ${p}`}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-400 ml-auto font-medium">
            {mensajes.length} solicitudes
          </span>
        </div>

        {/* Lista */}
        <div className="divide-y divide-gray-100 dark:divide-white/5 max-h-[620px] overflow-y-auto">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="p-5 flex gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))
          ) : mensajes.length === 0 ? (
            <div className="p-12 text-center">
              <LifeBuoy className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                No hay solicitudes de soporte
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {buscar || prioridad !== 'todos'
                  ? 'No se encontraron resultados para los filtros seleccionados.'
                  : 'Excelente, los mensajes de ayuda de los tenderos están al día.'}
              </p>
            </div>
          ) : (
            mensajes.map((item) => {
              const cfg = priorityConfig[item.priority] || priorityConfig.media;
              const PIcon = cfg.icon;
              const tendero = item.emisorTendero || (typeof item.emisor === 'object' ? item.emisor?.tendero : null);
              const rawNombre = tendero ? `${tendero.nombres || ''} ${tendero.apellidos || ''}`.trim() : item.destinatario;
              const nombreTendero = getSafeString(rawNombre, 'Tendero');
              const titulo = getSafeString(item.titulo, 'Sin asunto');
              const message = getSafeString(item.message, '');
              const dateStr = getSafeString(item.date, 'Reciente');
              const telefono = tendero?.telefono ? getSafeString(tendero.telefono) : '';

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedMensaje(item)}
                  className="p-5 hover:bg-white/60 dark:hover:bg-white/5 transition-colors flex gap-4 group cursor-pointer"
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className={`w-10 h-10 rounded-full ${cfg.bg} flex items-center justify-center ${cfg.text}`}>
                      <PIcon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {titulo && (
                          <span className="font-semibold text-gray-800 dark:text-white text-sm group-hover:text-[#1D9492] transition-colors">
                            {titulo}
                          </span>
                        )}
                        <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${cfg.badge}`}>
                          {item.priority}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-900/30 text-[#1D9492] flex items-center gap-1">
                          <User className="w-3 h-3" />
                          De: {nombreTendero}
                          {telefono ? ` (${telefono})` : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          {dateStr}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMensajeToDelete(item);
                          }}
                          title="Eliminar mensaje"
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2">
                      {message}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal de Detalle */}
      {selectedMensaje && (
        <SupportDetailModal
          mensaje={selectedMensaje}
          onClose={() => setSelectedMensaje(null)}
          onDelete={(m) => setMensajeToDelete(m)}
        />
      )}

      {/* Modal de Confirmación de Eliminación */}
      {mensajeToDelete && (
        <ConfirmDeleteSupportModal
          mensaje={mensajeToDelete}
          onClose={() => setMensajeToDelete(null)}
          onConfirm={handleConfirmDelete}
          deleting={deleting}
        />
      )}
    </div>
  );
}
