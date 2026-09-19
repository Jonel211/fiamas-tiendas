/**
 * StatusChart
 * Gráfico de pie con Activos/Inactivos separados por un pequeño gap.
 * Resumen con barras de progreso al costado derecho.
 * Tooltip al pasar el mouse por las rebanadas.
 */

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const DATA = [
  { name: 'Activos', value: 70, color: '#1F8A4C' },
  { name: 'Inactivos', value: 30, color: '#F2C94C' },
];

const StatusChart = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm h-full flex flex-col">
    <div className="mb-4">
      <h3 className="text-base font-semibold text-gray-800">Actividad</h3>
      <p className="text-xs text-gray-400 mt-0.5">Distribución actual de la plataforma</p>
    </div>

    <div className="grid grid-cols-5 gap-4 flex-1 items-center">
      {/* Pie */}
      <div className="col-span-3">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={DATA}
              cx="50%"
              cy="50%"
              outerRadius={95}
              paddingAngle={5}
              dataKey="value"
              stroke="#fff"
              strokeWidth={3}
            >
              {DATA.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                fontSize: 12,
              }}
              formatter={(value, name) => [`${value}`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Resumen */}
      <div className="col-span-2 flex flex-col gap-4">
        {DATA.map((item) => (
          <div key={item.name}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[12.5px] font-medium text-gray-600">{item.name}</span>
              </div>
              <span className="text-[13px] font-bold text-gray-800">{item.value}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${item.value}%`, backgroundColor: item.color }}
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">{item.value}% del total</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default StatusChart;