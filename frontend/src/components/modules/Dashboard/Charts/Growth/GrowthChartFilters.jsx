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
                ? 'bg-[#1D9492] text-white dark:bg-gradient-to-b dark:from-[#2EBFBB] dark:to-[#0B4A4A] dark:shadow-[0_0_14px_2px_rgba(46,196,182,0.55)]'
                : 'bg-white/60 dark:bg-white/10 text-gray-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-white/15'
            }`}
          >
            {r}
            {r === 'Rango Personalizado' && <Calendar className="w-3.5 h-3.5" />}
          </button>
        );
      })}

      <div className="ml-auto">
        <CustomSelect options={REGIONS} value={region} onChange={onRegionChange} />
      </div>
    </div>
  );
};

export default GrowthChartFilters;