// src/pages/BackupsPage.jsx
import BackupStats from '../components/modules/Backups/BackupStats';
import BackupFilters from '../components/modules/Backups/BackupFilters';
import BackupTimeline from '../components/modules/Backups/BackupTimeline';

const BackupsPage = () => {
  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Copias de Seguridad</h1>
        <p className="text-sm text-gray-500 mt-1">Historial y estado de los respaldos del sistema.</p>
      </div>

      {/* Estadísticas */}
      <BackupStats />

      {/* Filtros y buscador */}
      <BackupFilters />

      {/* Línea de tiempo */}
      <BackupTimeline />

      {/* Paginación (placeholder) */}
      <div className="flex justify-end items-center gap-3 text-sm text-gray-500 pt-2">
        <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
          Anterior
        </button>
        <span className="px-3 py-1 bg-brand-50 text-brand-600 font-medium rounded-lg border border-brand-200">
          1
        </span>
        <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          2
        </button>
        <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default BackupsPage;