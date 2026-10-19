/**
 * GrowthChart
 * Gráfico de barras con filtros y datos reales de la base de datos.
 * Fondo transparente sin blur.
 */

import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import GrowthChartFilters from './GrowthChartFilters';
import { RANGES, REGIONS } from './growthChartData';

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const formatMonthLabel = (mesStr) => {
  if (!mesStr) return '';
  const [year, month] = mesStr.split('-');
  return `${MONTH_NAMES[parseInt(month, 10) - 1]} ${year?.slice(2)}`;
};

const buildLast6Months = () => {
  const result = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    result.push({ monthKey: key, month: formatMonthLabel(key), tiendas: 0, tenderos: 0 });
  }
  return result;
};

const GrowthChart = ({ crecimientoTiendas = [], crecimientoTenderos = [], loading }) => {
  const [range, setRange] = useState(RANGES[2]);
  const [region, setRegion] = useState(REGIONS[0]);

  // Fusionar últimos 6 meses con datos reales de la API
  const base = buildLast6Months();
  const tiendasMap = {};
  crecimientoTiendas.forEach(item => { tiendasMap[item.mes] = parseInt(item.total); });
  const tenderosMap = {};
  crecimientoTenderos.forEach(item => { tenderosMap[item.mes] = parseInt(item.total); });

  const chartData = base.map(b => ({
    ...b,
    tiendas: tiendasMap[b.monthKey] || 0,
    tenderos: tenderosMap[b.monthKey] || 0,
  }));

  return (
    <div className="bg-white/85 dark:bg-[#1A1F2E]/80 rounded-md p-4 sm:p-6 shadow-sm transition-colors border border-white/50 dark:border-white/10">
      <GrowthChartFilters
        range={range}
        onRangeChange={setRange}
        region={region}
        onRegionChange={setRegion}
      />

      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-100 mb-0.5">
            Crecimiento de Nuevas Tiendas
          </h3>
          <p className="text-xs text-gray-400 dark:text-slate-500">
            Registros mensuales reales (últimos 6 meses)
          </p>
        </div>
      </div>

      {loading ? (
        <div className="h-[280px] bg-gray-50/50 dark:bg-white/5 rounded-lg animate-pulse flex items-center justify-center" />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              cursor={{ fill: 'rgba(29, 148, 146, 0.08)' }}
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
              formatter={(value) => [`${value} tiendas`, 'Nuevas Tiendas']}
            />
            <Bar dataKey="tiendas" fill="#1D9492" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default GrowthChart;