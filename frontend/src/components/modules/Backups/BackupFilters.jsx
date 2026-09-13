// src/components/modules/Backups/BackupFilters.jsx
import { Search, Filter } from 'lucide-react';

const BackupFilters = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
        {/* Buscador */}
        <div className="relative flex-1 sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por fecha o usuario..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>

        {/* Filtro de estado */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select className="pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer">
            <option value="">Todos los estados</option>
            <option value="success">Exitosos</option>
            <option value="failed">Fallidos</option>
            <option value="in_progress">En progreso</option>
          </select>
        </div>
      </div>

      {/* Botón de acción principal */}
      <button className="w-full sm:w-auto px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2">
        <span>Generar Backup</span>
        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">+</span>
      </button>
    </div>
  );
};

export default BackupFilters;