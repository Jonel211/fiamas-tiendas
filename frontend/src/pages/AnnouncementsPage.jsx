import { useState } from 'react';
import { Send, AlertTriangle, Bell, Mail, Smartphone, MessageCircle, Plus, X, Search, Clock } from 'lucide-react';
import iconAvisos from '@/assets/icons/sidebar/avisos.png';

const initialAnnouncements = [
  { id: 1, message: 'Actualización del sistema programada para esta noche. El panel no estará disponible por 2 horas.', priority: 'alta', date: '2023-10-08 10:00', channels: ['interno', 'email'] },
  { id: 2, message: 'Recuerden actualizar sus precios en la app para evitar incongruencias con los clientes.', priority: 'media', date: '2023-10-07 14:30', channels: ['interno', 'whatsapp'] },
  { id: 3, message: 'Nueva funcionalidad de reportes semanales ya está disponible en tu panel.', priority: 'baja', date: '2023-10-05 09:15', channels: ['interno'] },
];

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('media');
  const [channels, setChannels] = useState({
    interno: true,
    whatsapp: false,
    sms: false,
    email: false,
    push: false,
  });

  const handleChannelChange = (e) => {
    setChannels({ ...channels, [e.target.name]: e.target.checked });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedChannels = Object.keys(channels).filter(key => channels[key]);
    const newAnnouncement = {
      id: Date.now(),
      message,
      priority,
      channels: selectedChannels,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setAnnouncements([newAnnouncement, ...announcements]);
    alert('Aviso emitido correctamente (Simulación)');
    setMessage('');
    setIsModalOpen(false);
  };

  return (
    <div className="p-6">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/20 rounded-xl flex items-center justify-center">
            <img src={iconAvisos} alt="" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Avisos y Notificaciones</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Bandeja de avisos emitidos a tenderos.</p>
          </div>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-[#1D9492] hover:bg-[#167876] text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Emitir Nuevo Aviso
        </button>
      </div>

      {/* Bandeja de Entrada (Inbox) */}
      <div className="bg-white dark:bg-[#1A1F2E] rounded-xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 dark:text-white">Historial de Notificaciones</h2>
          <div className="relative w-64">
            <input type="text" placeholder="Buscar aviso..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-white/5 max-h-[600px] overflow-y-auto">
          {announcements.map((item) => (
            <div key={item.id} className="p-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex gap-4">
              <div className="flex-shrink-0 mt-1">
                {item.priority === 'alta' ? (
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                ) : item.priority === 'media' ? (
                  <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                    <Bell className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${item.priority === 'alta' ? 'bg-red-100 text-red-700' :
                      item.priority === 'media' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                    Prioridad {item.priority}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    {item.date}
                  </div>
                </div>
                <p className="text-gray-800 dark:text-gray-200 text-sm font-medium mt-2">{item.message}</p>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className="text-xs text-gray-500">Canales utilizados:</span>
                  {item.channels.map(ch => (
                    <span key={ch} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded text-xs capitalize flex items-center gap-1">
                      {ch === 'email' && <Mail className="w-3 h-3" />}
                      {ch === 'whatsapp' && <MessageCircle className="w-3 h-3" />}
                      {ch === 'sms' && <Smartphone className="w-3 h-3" />}
                      {ch}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {announcements.length === 0 && (
            <div className="p-8 text-center text-gray-500">No hay avisos registrados.</div>
          )}
        </div>
      </div>

      {/* Modal Emisión de Aviso */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1A1F2E] rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/30">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-teal-600" /> Emitir Nuevo Aviso
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Mensaje */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mensaje del Aviso</label>
                <textarea
                  required rows={3} value={message} onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                  placeholder="Escribe el contenido de la notificación aquí..."
                ></textarea>
              </div>

              {/* Prioridad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Nivel de Prioridad</label>
                <div className="grid grid-cols-3 gap-4">
                  {['baja', 'media', 'alta'].map((level) => (
                    <label key={level} className={`flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${priority === level ? (level === 'alta' ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : level === 'media' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400') : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                      <input type="radio" name="priority" value={level} checked={priority === level} onChange={(e) => setPriority(e.target.value)} className="sr-only" />
                      {level === 'alta' && <AlertTriangle className="w-4 h-4" />}
                      <span className="capitalize font-medium">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Canales */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Canales de Envío</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { id: 'interno', icon: Bell, label: 'Panel' },
                    { id: 'whatsapp', icon: MessageCircle, label: 'WhatsApp' },
                    { id: 'sms', icon: Smartphone, label: 'SMS' },
                    { id: 'email', icon: Mail, label: 'Email' },
                    { id: 'push', icon: Send, label: 'Push App' },
                  ].map((channel) => (
                    <label key={channel.id} className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${channels[channel.id] ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                      <input type="checkbox" name={channel.id} checked={channels[channel.id]} onChange={handleChannelChange} className="sr-only" />
                      <channel.icon className="w-5 h-5" />
                      <span className="text-xs font-medium">{channel.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors">Cancelar</button>
                <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-[#1D9492] hover:bg-[#167876] text-white rounded-lg font-medium transition-colors shadow-sm">
                  <Send className="w-4 h-4" /> Enviar Aviso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;