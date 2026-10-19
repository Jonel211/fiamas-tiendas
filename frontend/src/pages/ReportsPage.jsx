import { useState, useEffect, useCallback } from 'react';
import { Users, Store, TrendingUp, Activity, Download, RefreshCw, CheckCircle, XCircle, Loader, FileText, FileSpreadsheet } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { getEstadisticas } from '../services/reporteService';
import { useToast } from '../context/ToastContext';
import { exportReportToPDF, exportReportToExcel } from '../utils/reportExport';
import iconReportes from '@/assets/icons/sidebar/reportes.png';

// Utilidades
const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const formatMonthLabel = (mesStr) => {
  if (!mesStr) return '';
  const [year, month] = mesStr.split('-');
  return `${MONTH_NAMES[parseInt(month, 10) - 1]} ${year?.slice(2)}`;
};

// Generar los últimos 6 meses para el eje X (aunque no haya datos)
const buildLast6Months = () => {
  const result = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    result.push({ mes: key, label: formatMonthLabel(key), total: 0 });
  }
  return result;
};

const mergeMonthlyData = (base, apiData) => {
  const map = {};
  apiData.forEach(item => { map[item.mes] = parseInt(item.total); });
  return base.map(b => ({ ...b, total: map[b.mes] || 0 }));
};

// Tooltip personalizado
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#1A1F2E] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 shadow-lg text-sm">
        <p className="font-medium text-gray-700 dark:text-gray-200">{label}</p>
        <p className="text-[#1D9492] font-semibold">{payload[0].value} registros</p>
      </div>
    );
  }
  return null;
};

// Tarjeta de estadística
const StatCard = ({ label, value, sub, icon: Icon, color, bg, loading }) => (
  <div className="bg-white/85 dark:bg-[#1A1F2E]/80 rounded-md p-4 sm:p-5 border border-white/50 dark:border-white/10 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        {loading
          ? <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mt-1" />
          : <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{value ?? '—'}</h3>
        }
      </div>
      <div className={`p-2 rounded-lg ${bg} dark:bg-gray-800/80`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
    {!loading && sub && (
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 font-medium">{sub}</p>
    )}
  </div>
);

// Tabla de los mejores tenderos
const TopTenderosTable = ({ data, loading }) => (
  <div className="bg-white/85 dark:bg-[#1A1F2E]/80 rounded-md border border-white/50 dark:border-white/10 shadow-sm overflow-hidden transition-colors">
    <div className="px-5 py-4 border-b border-white/40 dark:border-white/10">
      <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Top 5 Tenderos por Tiendas</h3>
    </div>
    {loading ? (
      <div className="p-5 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-1" />
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            </div>
            <div className="h-5 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    ) : data.length === 0 ? (
      <div className="p-8 text-center text-gray-400 text-sm">Sin datos disponibles.</div>
    ) : (
      <div className="divide-y divide-gray-100/60 dark:divide-white/5">
        {data.map((t, i) => (
          <div key={t.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/20 dark:hover:bg-white/5 transition-colors">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
              }`}>
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{t.nombre}</p>
              <p className="text-xs text-gray-400">DNI: {t.dni}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t.totalTiendas}</span>
              <span className="text-xs text-gray-400">tiendas</span>
              {t.activo
                ? <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                : <XCircle className="w-3.5 h-3.5 text-red-400" />
              }
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Página principal
const ReportsPage = () => {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartMode, setChartMode] = useState('tiendas'); // 'tiendas' | 'tenderos'

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getEstadisticas();
      setData(res);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const base = buildLast6Months();
  const chartDataTiendas = data ? mergeMonthlyData(base, data.crecimientoTiendas || []) : base;
  const chartDataTenderos = data ? mergeMonthlyData(base, data.crecimientoTenderos || []) : base;
  const chartData = chartMode === 'tiendas' ? chartDataTiendas : chartDataTenderos;

  const statCards = [
    {
      label: 'Total Tiendas',
      value: data?.resumen?.totalTiendas,
      sub: `${data?.resumen?.tiendasActivas ?? '—'} activas · ${data?.resumen?.tasaActividadTiendas ?? '—'}% actividad`,
      icon: Store,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'Total Tenderos',
      value: data?.resumen?.totalTenderos,
      sub: `${data?.resumen?.tenderosActivos ?? '—'} activos · ${data?.resumen?.tasaActividadTenderos ?? '—'}% actividad`,
      icon: Users,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      label: 'Tiendas Activas',
      value: data?.resumen?.tiendasActivas,
      sub: `De un total de ${data?.resumen?.totalTiendas ?? '—'} tiendas`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      label: 'Tasa de Actividad',
      value: data ? `${data.resumen.tasaActividadTiendas}%` : undefined,
      sub: 'Tiendas activas sobre el total',
      icon: Activity,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src={iconReportes} alt="Reportes" className="w-9 h-9 sm:w-10 sm:h-10 object-contain flex-shrink-0" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Reportes y Estadísticas</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Métricas de desempeño de tiendas y tenderos.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={load} title="Actualizar datos" disabled={loading} className="p-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              try {
                exportReportToExcel(data, chartData);
                toast.success('Reporte en Excel descargado correctamente');
              } catch (e) {
                console.error(e);
                toast.error('Error al generar el archivo Excel');
              }
            }}
            disabled={loading || !data}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet className="w-4 h-4" /> Exportar Excel
          </button>

          <button
            onClick={() => {
              try {
                exportReportToPDF(data, chartDataTiendas, chartDataTenderos);
                toast.success('Reporte en PDF descargado correctamente');
              } catch (e) {
                console.error(e);
                toast.error('Error al generar el archivo PDF');
              }
            }}
            disabled={loading || !data}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#1D9492] hover:bg-[#167876] text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="w-4 h-4" /> Exportar PDF
          </button>
        </div>
      </div>

      {/* Tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <StatCard key={i} {...s} loading={loading} />
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart: Crecimiento */}
        <div className="bg-white/85 dark:bg-[#1A1F2E]/80 rounded-md border border-white/50 dark:border-white/10 shadow-sm p-4 sm:p-5 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Crecimiento — Últimos 6 meses</h3>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Registros mensuales en la plataforma</p>
            </div>
            <div className="flex gap-1 bg-white/50 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-lg p-1">
              <button
                onClick={() => setChartMode('tiendas')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${chartMode === 'tiendas' ? 'bg-[#1D9492] text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'}`}
              >
                Tiendas
              </button>
              <button
                onClick={() => setChartMode('tenderos')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${chartMode === 'tenderos' ? 'bg-[#1D9492] text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'}`}
              >
                Tenderos
              </button>
            </div>
          </div>

          {loading ? (
            <div className="h-56 bg-white/50 dark:bg-white/5 rounded-lg animate-pulse flex items-center justify-center">
              <Loader className="w-6 h-6 text-gray-300 animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1D9492" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1D9492" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.3} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="total" stroke="#1D9492" strokeWidth={2} fill="url(#colorGradient)" dot={{ fill: '#1D9492', r: 3 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top tenderos */}
        <TopTenderosTable data={data?.topTenderos || []} loading={loading} />
      </div>

      {/* Última actividad */}
      {(data?.ultimaActividad?.length > 0) && (
        <div className="bg-white/85 dark:bg-[#1A1F2E]/80 rounded-md border border-white/50 dark:border-white/10 shadow-sm overflow-hidden transition-colors">
          <div className="px-5 py-4 border-b border-white/40 dark:border-white/10">
            <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Última Actividad del Sistema</h3>
          </div>
          <div className="divide-y divide-gray-100/60 dark:divide-white/5">
            {data.ultimaActividad.map((log) => (
              <div key={log.id} className="flex items-start gap-3 px-5 py-3 hover:bg-white/20 dark:hover:bg-white/5 transition-colors">
                <div className="w-2 h-2 rounded-full bg-[#1D9492] mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200 capitalize">{log.accion?.replace(/_/g, ' ')}</p>
                  {log.descripcion && <p className="text-xs text-gray-400 truncate">{log.descripcion}</p>}
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {log.fecha ? new Date(log.fecha).toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;