/**
 * GrowthChartFilters
 * Filtros del gráfico: botones de rango + selector de región.
 */

import { Calendar } from 'lucide-react';
import CustomSelect from '@/components/ui/CustomSelect';
import { RANGES, REGIONS } from './growthChartData';

const GrowthChartFilters = ({ range, onRangeChange, region, onRegionChange }) => {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {RANGES.map((r) => {
        const isActive = range === r;
        return (
          <button
            key={r}
            onClick={() => onRangeChange(r)}
            className={`px-4 py-1.5 text-[12.5px] font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              isActive
                ? 'bg-[#1D9492] text-white dark:bg-[#1D9492] shadow-sm'
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
            className="px-3 py-1.5 text-[12.5px] rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#242B3D] text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#1D9492]"
          />
          <span className="text-gray-400 text-sm">-</span>
          <input
            type="date"
            className="px-3 py-1.5 text-[12.5px] rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#242B3D] text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#1D9492]"
          />
        </div>
      )}

      <div className="ml-auto">
        <CustomSelect options={REGIONS} value={region} onChange={onRegionChange} />
      </div>
    </div>
  );
};

export default GrowthChartFilters;