import { Search, X, RotateCcw, Plus } from 'lucide-react';

const VendorsFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onClearFilters,
  onOpenModal
}) => {
  const hasActiveFilters = Boolean(searchTerm?.trim() || statusFilter !== 'all');

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4 items-stretch sm:items-center">
      {onOpenModal && (
        <button
          type="button"
          onClick={() => onOpenModal()}
          className="flex items-center justify-center gap-2 bg-[#1D9492] hover:bg-[#167876] text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm text-sm whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Tendero</span>
        </button>
      )}

      <div className="flex-1 relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por nombre, apellidos, DNI o teléfono..."
          className="w-full pl-10 pr-9 py-2 bg-white dark:bg-[#1A1F2E] border border-gray-200 dark:border-gray-700 rounded-lg text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-[#1D9492] dark:text-white transition-all"
        />
        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        {searchTerm && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            title="Borrar texto de búsqueda"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className="px-4 py-2 bg-white dark:bg-[#1A1F2E] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#1D9492] cursor-pointer"
      >
        <option value="all">Todos los tenderos</option>
        <option value="active">Activos</option>
        <option value="inactive">Inactivos</option>
      </select>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white hover:bg-rose-50 dark:bg-[#1A1F2E] dark:hover:bg-rose-950/30 text-xs font-medium text-gray-600 hover:text-rose-600 dark:text-gray-300 dark:hover:text-rose-400 border border-gray-200 hover:border-rose-200 dark:border-gray-700 dark:hover:border-rose-800/60 rounded-lg shadow-xs transition-colors cursor-pointer whitespace-nowrap"
          title="Restablecer todos los filtros y búsqueda"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Limpiar filtros</span>
        </button>
      )}
    </div>
  );
};

export default VendorsFilters;