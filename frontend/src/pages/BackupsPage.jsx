// src/pages/BackupsPage.jsx
import BackupStats from '../components/modules/Backups/BackupStats';
import BackupFilters from '../components/modules/Backups/BackupFilters';
import BackupTimeline from '../components/modules/Backups/BackupTimeline';
import iconBackups from '@/assets/icons/sidebar/backups.png';

const BackupsPage = () => {
  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
          <img src={iconBackups} alt="" className="w-6 h-6 object-contain" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Copias de Seguridad</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Historial y estado de los respaldos del sistema.</p>
        </div>
      </div>

      {/* Estadísticas */}
      <BackupStats />

      {/* Filtros y buscador */}
      <BackupFilters />

      {/* Línea de tiempo */}
      <BackupTimeline />

      {/* Paginación (placeholder) */}
      <div className="flex justify-end items-center gap-3 text-sm text-gray-500 dark:text-gray-400 pt-2">
        <button className="px-3 py-1 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50">
          Anterior
        </button>
        <span className="px-3 py-1 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 font-medium rounded-lg border border-brand-200 dark:border-brand-800">
          1
        </span>
        <button className="px-3 py-1 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
          2
        </button>
        <button className="px-3 py-1 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default BackupsPage;