import { Users, Store, Download, TrendingUp, Activity } from 'lucide-react';
import iconReportes from '@/assets/icons/sidebar/reportes.png';

const ReportsPage = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center">
            <img src={iconReportes} alt="" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Reportes y Estadísticas</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Métricas de desempeño de tiendas y tenderos.</p>
          </div>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm text-gray-700 dark:text-gray-200">
          <Download className="w-4 h-4" />
          Exportar PDF
        </button>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Tiendas', value: '142', trend: '+12% este mes', icon: Store, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Tenderos Activos', value: '89', trend: '+5% este mes', icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Volumen Transaccional', value: '$24.5k', trend: '+18% este mes', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Tasa de Actividad', value: '78%', trend: '-2% este mes', icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#1A1F2E] rounded-xl p-5 border border-gray-100 dark:border-white/5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{stat.value}</h3>
              </div>
              <div className={`p-2 rounded-lg ${stat.bg} dark:bg-gray-800 ${stat.color} dark:text-gray-300`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-4 font-medium">{stat.trend}</p>
          </div>
        ))}
      </div>

      {/* Gráficos y Tablas Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#1A1F2E] rounded-xl border border-gray-100 dark:border-white/5 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Crecimiento de Tiendas (Últimos 6 meses)</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-400">Área para gráfico (Recharts)</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1A1F2E] rounded-xl border border-gray-100 dark:border-white/5 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Top 5 Tenderos por Actividad</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-400">Área para tabla o listado</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;