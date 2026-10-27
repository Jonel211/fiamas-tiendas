/**
 * GrowthChartFilters
 * Filtros del gráfico: botones de rango + selector de región + botón limpiar filtro.
 */

import { Calendar, RotateCcw } from 'lucide-react';
import CustomSelect from '@/components/ui/CustomSelect';
import { RANGES, REGIONS } from './growthChartData';

const GrowthChartFilters = ({
  range,
  onRangeChange,
  region,
  onRegionChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  isFiltered,
  onReset
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {RANGES.map((r) => {
        const isActive = range === r;
        return (
          <button
            key={r}
            type="button"
            onClick={() => onRangeChange(r)}
            className={`px-3.5 py-1.5 text-[12.5px] font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              isActive
                ? 'bg-[#1D9492] text-white shadow-sm font-semibold'
                : 'bg-white border border-gray-200 dark:border-white/10 dark:bg-[#242B3D] text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
            {r}
            {r === 'Rango Personalizado' && <Calendar className="w-3.5 h-3.5" />}
          </button>
        );
      })}

      {range === 'Rango Personalizado' && (
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
          <input
            type="date"
            value={startDate || ''}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="px-2.5 py-1 text-[12px] rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#242B3D] text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#1D9492]"
          />
          <span className="text-gray-400 text-xs">-</span>
          <input
            type="date"
            value={endDate || ''}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="px-2.5 py-1 text-[12px] rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#242B3D] text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#1D9492]"
          />
        </div>
      )}

      {/* Botón Limpiar filtro visible cuando hay filtros activos */}
      {isFiltered && (
        <button
          type="button"
          onClick={onReset}
          className="px-2.5 py-1.5 text-[12px] font-semibold text-red-600 dark:text-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800/40 rounded-lg transition-colors flex items-center gap-1 shadow-2xs cursor-pointer animate-in fade-in duration-200"
          title="Restablecer filtros del gráfico"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Limpiar filtro</span>
        </button>
      )}

      <div className="ml-auto">
        <CustomSelect options={REGIONS} value={region} onChange={onRegionChange} />
      </div>
    </div>
  );
};

export default GrowthChartFilters;