/**
 * GrowthChart
 * Gráfico de barras con filtros de rango y región.
 * Fondo azul claro y barras azules.
 */

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const DATA = [
  { month: 'Ene', tiendas: 120 },
  { month: 'Feb', tiendas: 145 },
  { month: 'Mar', tiendas: 178 },
  { month: 'Abr', tiendas: 210 },
  { month: 'May', tiendas: 245 },
  { month: 'Jun', tiendas: 278 },
];

const RANGES = ['Últimos 7 días', 'Últimos 30 días', 'Este mes', 'Rango Personalizado'];

const GrowthChart = () => {
  const [range, setRange] = useState(RANGES[2]);
  const [region, setRegion] = useState('Todas las Regiones');

  return (
    <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: '#E8F0FE' }}>
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-4 py-1.5 text-[12.5px] font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              range === r
                ? 'bg-[#1F8A4C] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {r}
            {r === 'Rango Personalizado' && <Calendar className="w-3.5 h-3.5" />}
          </button>
        ))}
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="ml-auto px-4 py-1.5 text-[12.5px] font-medium rounded-lg bg-white text-gray-700 border-0 focus:outline-none"
        >
          <option>Todas las Regiones</option>
          <option>Lima</option>
          <option>Provincias</option>
        </select>
      </div>

      <h3 className="text-sm font-semibold text-gray-800 mb-1">Crecimiento de Tiendas</h3>
      <p className="text-xs text-gray-500 mb-4">Últimos 6 meses</p>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={DATA}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip />
          <Bar dataKey="tiendas" fill="#4F46E5" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GrowthChart;