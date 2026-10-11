/**
 * GrowthChart
 * Gráfico de barras con filtros de rango y región.
 * Fondo transparente sin blur.
 *
 * Compuesto por:
 * - GrowthChartFilters (botones + selector)
 * - growthChartData (datos)
 */

import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import GrowthChartFilters from './GrowthChartFilters';
import { GROWTH_DATA, RANGES, REGIONS } from './growthChartData';

const GrowthChart = () => {
  const [range, setRange] = useState(RANGES[2]);
  const [region, setRegion] = useState(REGIONS[0]);

  return (
    <div className="bg-white/85 dark:bg-[#1A1F2E]/80 rounded-md p-4 sm:p-6 shadow-sm transition-colors border border-white/50 dark:border-white/10">
      <GrowthChartFilters
        range={range}
        onRangeChange={setRange}
        region={region}
        onRegionChange={setRegion}
      />

      <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-100 mb-1">
        Crecimiento de Tiendas
      </h3>
      <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">
        Últimos 6 meses
      </p>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={GROWTH_DATA}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={false}
            contentStyle={{
              borderRadius: 8,
              border: '1px solid rgba(148, 163, 184, 0.3)',
              backgroundColor: 'rgba(30, 41, 59, 0.95)',
              color: '#F1F5F9',
              fontSize: 12,
              padding: '8px 12px',
              boxShadow: '0 8px 16px -6px rgba(0,0,0,0.4)',
            }}
            itemStyle={{ color: '#2EC4B6' }}
            labelStyle={{ color: '#F1F5F9', fontWeight: 600, marginBottom: 4 }}
            formatter={(value) => [`${value} tiendas`, '']}
          />
          <Bar dataKey="tiendas" fill="#1D9492" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GrowthChart;