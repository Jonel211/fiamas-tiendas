/**
 * StatusLegend
 * Leyenda con nombre, valor y barra de progreso por cada estado.
 */

import { STATUS_DATA } from './statusChartData';

const StatusLegend = () => {
  return (
    <div className="sm:col-span-2 flex flex-col gap-3 sm:gap-4">
      {STATUS_DATA.map((item) => (
        <div key={item.name}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[12.5px] font-medium text-gray-600 dark:text-slate-400">
                {item.name}
              </span>
            </div>
            <span className="text-[13px] font-bold text-gray-800 dark:text-slate-100">
              {item.value}
            </span>
          </div>
          <div className="h-1.5 bg-gray-200/50 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${item.value}%`, backgroundColor: item.color }}
            />
          </div>
          <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1">
            {item.value}% del total
          </p>
        </div>
      ))}
    </div>
  );
};

export default StatusLegend;