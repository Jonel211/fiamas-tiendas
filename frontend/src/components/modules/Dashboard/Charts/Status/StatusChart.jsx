/**
 * StatusChart
 * Gráfico de pie con Activos/Inactivos + resumen con barras de progreso.
 * Fondo transparente sin blur con datos reales.
 */

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import StatusLegend from './StatusLegend';

const StatusChart = ({ resumen, loading }) => {
  const total = (resumen?.totalTiendas || 0) + (resumen?.totalTenderos || 0);
  const activos = (resumen?.tiendasActivas || 0) + (resumen?.tenderosActivos || 0);
  const inactivos = Math.max(0, total - activos);

  const pctActivos = total > 0 ? Math.round((activos / total) * 100) : 100;
  const pctInactivos = total > 0 ? Math.round((inactivos / total) * 100) : 0;

  const chartData = [
    { name: 'Activos', value: pctActivos, count: activos, color: '#1D9492' },
    { name: 'Inactivos', value: pctInactivos, count: inactivos, color: '#E0AA3D' },
  ];

  return (
    <div className="bg-white/85 dark:bg-[#1A1F2E]/80 rounded-md p-4 sm:p-6 shadow-sm h-full flex flex-col transition-colors border border-white/50 dark:border-white/10">
      <div className="mb-3 sm:mb-4">
        <h3 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-slate-100">
          Actividad
        </h3>
        <p className="text-[11px] sm:text-xs text-gray-400 dark:text-slate-500 mt-0.5">
          Distribución de tiendas y tenderos en la plataforma
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 sm:gap-6 flex-1 items-center">
        <div className="sm:col-span-3">
          {loading ? (
            <div className="h-[200px] flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-4 border-gray-200 dark:border-gray-700 animate-pulse" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  cursor={false}
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    backgroundColor: 'rgba(30, 41, 59, 0.95)',
                    color: '#F1F5F9',
                    fontSize: 12,
                  }}
                  formatter={(value, name) => [`${value}%`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <StatusLegend data={chartData} />
      </div>
    </div>
  );
};

export default StatusChart;