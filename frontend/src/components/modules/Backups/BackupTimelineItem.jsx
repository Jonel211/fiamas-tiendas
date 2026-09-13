// src/components/modules/Backups/BackupTimelineItem.jsx
import { CheckCircle, XCircle, Loader, Download } from 'lucide-react';

const statusConfig = {
  success: {
    color: 'green',
    icon: CheckCircle,
    bgColor: 'bg-green-100',
    ringColor: 'ring-green-300',
    textColor: 'text-green-600',
    label: 'Exitoso',
  },
  failed: {
    color: 'red',
    icon: XCircle,
    bgColor: 'bg-red-100',
    ringColor: 'ring-red-300',
    textColor: 'text-red-600',
    label: 'Fallido',
  },
  in_progress: {
    color: 'yellow',
    icon: Loader,
    bgColor: 'bg-yellow-100',
    ringColor: 'ring-yellow-300',
    textColor: 'text-yellow-600',
    label: 'En progreso',
  },
};

const BackupTimelineItem = ({ date, time, size, status, type, user }) => {
  const config = statusConfig[status];
  const Icon = config.icon;
  const isInProgress = status === 'in_progress';

  return (
    <div className="relative pl-8 pb-8 last:pb-0 group">
      {/* Línea vertical conectora (se extiende hacia abajo) */}
      {!isInProgress && (
        <div className="absolute left-[11px] top-5 bottom-0 w-0.5 bg-gray-200 group-last:hidden" />
      )}

      {/* Círculo con icono */}
      <div className="absolute left-0 top-1 flex items-center justify-center">
        <div
          className={`
            w-6 h-6 rounded-full border-4 border-white shadow-md flex items-center justify-center
            ${config.bgColor} ${config.ringColor}
            ${isInProgress ? 'animate-pulse' : ''}
          `}
        >
          <Icon className={`w-3 h-3 ${config.textColor}`} />
        </div>
      </div>

      {/* Contenido de la tarjeta */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 ml-4 transition-all duration-200 hover:shadow-md hover:border-brand-200 hover:scale-[1.01]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-800">{date}</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-sm text-gray-500">{time}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.bgColor} ${config.textColor}`}>
              {config.label}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">{size}</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500">{type}</span>
            {user && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500">por {user}</span>
              </>
            )}
            <button className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupTimelineItem;