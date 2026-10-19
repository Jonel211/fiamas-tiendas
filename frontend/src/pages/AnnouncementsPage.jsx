import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Send, AlertTriangle, Bell, Smartphone, MessageCircle, Plus, X, Search, Clock, Trash2, RefreshCw, Loader, User } from 'lucide-react';
import { getAvisos, crearAviso, eliminarAviso } from '../services/avisoService';
import { getVendors } from '../services/vendorService';
import { useToast } from '../context/ToastContext';
import iconAvisos from '@/assets/icons/sidebar/avisos.png';

const priorityConfig = {
  alta: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400', icon: AlertTriangle },
  urgente: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400', icon: AlertTriangle },
  media: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400', badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400', icon: Bell },
  baja: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400', icon: MessageCircle },
};

// Canales estrictamente solicitados: WhatsApp, SMS y Aplicación
const channelIcons = {
  whatsapp: { icon: MessageCircle, label: 'WhatsApp', desc: 'Mensaje directo' },
  sms: { icon: Smartphone, label: 'SMS', desc: 'Mensaje de texto' },
  aplicacion: { icon: Bell, label: 'Aplicación', desc: 'Notificación interna' },
};

// Modal para emitir avisos
const AvisoModal = ({ onClose, onSubmit, submitting }) => {
  const [titulo, setTitulo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [prioridad, setPrioridad] = useState('media');
  const [tenderoId, setTenderoId] = useState('todos');
  const [tenderosList, setTenderosList] = useState([]);
  const [loadingTenderos, setLoadingTenderos] = useState(true);
  const [channels, setChannels] = useState({
    whatsapp: true,
    sms: false,
    aplicacion: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchTenderos = async () => {
      try {
        setLoadingTenderos(true);
        const data = await getVendors();
        setTenderosList(Array.isArray(data) ? data : (data?.tenderos || []));
      } catch (err) {
        console.error('Error cargando tenderos:', err);
      } finally {
        setLoadingTenderos(false);
      }
    };
    fetchTenderos();
  }, []);

  const validate = () => {
    const e = {};
    if (!titulo.trim()) e.titulo = 'El título es obligatorio.';
    if (!mensaje.trim()) e.mensaje = 'El mensaje es obligatorio.';
    else if (mensaje.trim().length < 5) e.mensaje = 'El mensaje debe tener al menos 5 caracteres.';
    if (!Object.values(channels).some(Boolean)) e.channels = 'Selecciona al menos un canal de envío.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const canales = Object.keys(channels).filter(k => channels[k]);
    onSubmit({
      titulo,
      mensaje,
      prioridad,
      canales,
      tendero_id: tenderoId === 'todos' ? null : tenderoId,
    });
  };

  return createPortal(
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      style={{ top: 0, left: 0, right: 0, bottom: 0, margin: 0 }}
    >
      <div className="bg-white dark:bg-[#1A1F2E] rounded-xl shadow-xl w-full max-w-2xl border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white dark:bg-[#1A1F2E] z-10">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Send className="w-5 h-5 text-[#1D9492]" /> Emitir Nuevo Aviso
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Destinatario (Elegir Tendero) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#1D9492]" /> Destinatario del Aviso
            </label>
            <select
              value={tenderoId}
              onChange={e => setTenderoId(e.target.value)}
              disabled={loadingTenderos}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0F1420] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1D9492]/30 focus:border-[#1D9492] outline-none transition-all text-sm cursor-pointer disabled:opacity-50"
            >
              <option value="todos">📢 Todos los tenderos (Difusión General)</option>
              {tenderosList.map((t) => (
                <option key={t.id} value={t.id}>
                  👤 {t.nombres} {t.apellidos} {t.dni ? `· DNI: ${t.dni}` : ''} {t.telefono ? `· Cel: ${t.telefono}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Título del Aviso</label>
            <input
              type="text"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="Ej: Actualización de políticas de crédito o recordatorio"
              className={`w-full px-4 py-2.5 rounded-lg border ${errors.titulo ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-[#0F1420] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1D9492]/30 focus:border-[#1D9492] outline-none transition-all text-sm`}
            />
            {errors.titulo && <p className="text-xs text-red-500 mt-1">{errors.titulo}</p>}
          </div>

          {/* Mensaje */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mensaje</label>
            <textarea
              rows={3}
              value={mensaje}
              onChange={e => setMensaje(e.target.value)}
              placeholder="Escribe el contenido detallado del aviso que se enviará al tendero..."
              className={`w-full px-4 py-3 rounded-lg border ${errors.mensaje ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-[#0F1420] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1D9492]/30 focus:border-[#1D9492] outline-none resize-none transition-all text-sm`}
            />
            {errors.mensaje && <p className="text-xs text-red-500 mt-1">{errors.mensaje}</p>}
            <p className="text-xs text-gray-400 mt-1 text-right">{mensaje.length} caracteres</p>
          </div>

          {/* Prioridad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nivel de Prioridad</label>
            <div className="grid grid-cols-3 gap-3">
              {['baja', 'media', 'alta'].map((level) => {
                const cfg = priorityConfig[level];
                return (
                  <label
                    key={level}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${prioridad === level
                        ? `${cfg.bg} border-current ${cfg.text}`
                        : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={level}
                      checked={prioridad === level}
                      onChange={e => setPrioridad(e.target.value)}
                      className="sr-only"
                    />
                    {level === 'alta' && <AlertTriangle className="w-4 h-4" />}
                    <span className="capitalize font-medium text-sm">{level}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Canales de envío (ÚNICAMENTE WhatsApp, SMS, Aplicación) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Canales de Envío
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.entries(channelIcons).map(([id, { icon: Icon, label, desc }]) => (
                <label
                  key={id}
                  className={`flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${channels[id]
                      ? 'border-[#1D9492] bg-teal-50 dark:bg-teal-900/20 text-[#1D9492]'
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={channels[id]}
                    onChange={e => setChannels(prev => ({ ...prev, [id]: e.target.checked }))}
                    className="sr-only"
                  />
                  <div className={`p-2 rounded-lg ${channels[id] ? 'bg-[#1D9492] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold block">{label}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{desc}</span>
                  </div>
                </label>
              ))}
            </div>
            {errors.channels && <p className="text-xs text-red-500 mt-1.5">{errors.channels}</p>}
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2 bg-[#1D9492] hover:bg-[#167876] text-white rounded-lg font-medium transition-colors shadow-sm text-sm disabled:opacity-60"
            >
              {submitting ? (
                <><Loader className="w-4 h-4 animate-spin" /> Emitiendo aviso...</>
              ) : (
                <><Send className="w-4 h-4" /> Emitir Aviso</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

// Modal de confirmación para eliminar aviso
const ConfirmDeleteAvisoModal = ({ aviso, onClose, onConfirm, deleting }) => {
  if (!aviso) return null;

  return createPortal(
    <div
      onClick={(e) => { if (e.target === e.currentTarget && !deleting) onClose(); }}
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
          ¿Eliminar este aviso?
        </h3>

        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Esta acción removerá el aviso de la bandeja y de los canales de comunicación de los tenderos.
        </p>

        <div className="bg-gray-50 dark:bg-[#0F1420] rounded-lg p-3.5 border border-gray-100 dark:border-white/5 mb-5 text-left">
          <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
            {aviso.titulo || 'Sin título'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
            {aviso.message}
          </p>
          <div className="mt-2 pt-2 border-t border-gray-200/50 dark:border-white/5 flex items-center justify-between text-[11px] text-gray-400">
            <span>Para: {aviso.destinatario?.label || 'Todos'}</span>
            <span className="capitalize">{aviso.priority}</span>
          </div>
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
              <><Loader className="w-4 h-4 animate-spin" /> Eliminando...</>
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

// Página principal de Avisos
const AnnouncementsPage = () => {
  const toast = useToast();
  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buscar, setBuscar] = useState('');
  const [prioridad, setPrioridad] = useState('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [avisoToDelete, setAvisoToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadAvisos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAvisos({ buscar, prioridad });
      setAvisos(data.avisos || []);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar los avisos');
    } finally {
      setLoading(false);
    }
  }, [buscar, prioridad, toast]);

  useEffect(() => {
    const t = setTimeout(() => loadAvisos(), buscar ? 350 : 0);
    return () => clearTimeout(t);
  }, [loadAvisos, buscar]);

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      const result = await crearAviso(formData);
      toast.success(result.msg || 'Aviso emitido exitosamente');
      setIsModalOpen(false);
      await loadAvisos();
    } catch (err) {
      toast.error(err.message || 'Error al emitir el aviso');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!avisoToDelete) return;
    try {
      setDeletingId(avisoToDelete.id);
      await eliminarAviso(avisoToDelete.id);
      setAvisos(prev => prev.filter(a => a.id !== avisoToDelete.id));
      toast.success('Aviso eliminado correctamente');
      setAvisoToDelete(null);
    } catch (err) {
      toast.error(err.message || 'Error al eliminar el aviso');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src={iconAvisos} alt="Avisos" className="w-9 h-9 sm:w-10 sm:h-10 object-contain flex-shrink-0" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Avisos y Notificaciones</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Emisión de alertas directas y masivas a tenderos.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadAvisos}
            title="Actualizar"
            className="p-2 rounded-md border border-white/50 dark:border-white/10 bg-white/85 dark:bg-[#1A1F2E]/80 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#1D9492] hover:bg-[#167876] text-white px-4 py-2 rounded-md font-semibold transition-colors shadow-sm text-sm"
          >
            <Plus className="w-4 h-4" /> Emitir Aviso
          </button>
        </div>
      </div>

      {/* Bandeja de Avisos con fondo transparente estilo Dashboard */}
      <div className="bg-white/85 dark:bg-[#1A1F2E]/80 rounded-md shadow-sm border border-white/50 dark:border-white/10 overflow-hidden backdrop-blur-sm transition-colors">
        {/* Barra de filtros */}
        <div className="p-4 border-b border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={buscar}
              onChange={e => setBuscar(e.target.value)}
              placeholder="Buscar por título o contenido..."
              className="w-full pl-9 pr-4 py-2 rounded-md border border-white/50 dark:border-white/10 bg-white/85 dark:bg-[#0F1420]/80 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9492]/30 focus:border-[#1D9492] text-gray-900 dark:text-white transition-all shadow-sm backdrop-blur-sm"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['todos', 'alta', 'media', 'baja'].map(p => (
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
          <span className="text-xs text-gray-400 ml-auto font-medium">{avisos.length} avisos</span>
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
          ) : avisos.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No hay avisos registrados</p>
              <p className="text-xs text-gray-400 mt-1">Presiona "Emitir Aviso" para enviar una nueva comunicación.</p>
            </div>
          ) : (
            avisos.map((item) => {
              const cfg = priorityConfig[item.priority] || priorityConfig.media;
              const PIcon = cfg.icon;
              const channels = Array.isArray(item.channels) ? item.channels : (item.channels || '').split(',');
              return (
                <div key={item.id} className="p-5 hover:bg-white/60 dark:hover:bg-white/5 transition-colors flex gap-4 group">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`w-10 h-10 rounded-full ${cfg.bg} flex items-center justify-center ${cfg.text}`}>
                      <PIcon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.titulo && (
                          <span className="font-semibold text-gray-800 dark:text-white text-sm">{item.titulo}</span>
                        )}
                        <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${cfg.badge}`}>
                          {item.priority}
                        </span>
                        {/* Destinatario Badge */}
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-900/30 text-[#1D9492] flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {item.destinatario?.label || 'Todos los tenderos'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          {item.date}
                        </div>
                        <button
                          onClick={() => setAvisoToDelete(item)}
                          title="Eliminar aviso"
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">{item.message}</p>
                    <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                      <span className="text-xs text-gray-400">Canales de difusión:</span>
                      {channels.filter(Boolean).map(ch => {
                        const chCfg = channelIcons[ch] || { icon: Bell, label: ch };
                        const ChIcon = chCfg.icon;
                        return (
                          <span key={ch} className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded text-xs flex items-center gap-1 font-medium capitalize">
                            <ChIcon className="w-3 h-3 text-[#1D9492]" /> {chCfg.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal para emitir aviso */}
      {isModalOpen && (
        <AvisoModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}

      {/* Modal de confirmación para eliminar aviso */}
      {avisoToDelete && (
        <ConfirmDeleteAvisoModal
          aviso={avisoToDelete}
          onClose={() => setAvisoToDelete(null)}
          onConfirm={handleConfirmDelete}
          deleting={deletingId === avisoToDelete.id}
        />
      )}
    </div>
  );
};

export default AnnouncementsPage;