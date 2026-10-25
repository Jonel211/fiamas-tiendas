/**
 * DashboardPage
 * Panel principal administrativo conectado a datos reales de la base de datos.
 */

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import MetricCards from '@/components/modules/Dashboard/MetricCards/MetricCards';
import StatusChart from '@/components/modules/Dashboard/Charts/Status/StatusChart';
import GrowthChart from '@/components/modules/Dashboard/Charts/Growth/GrowthChart';
import RecentVendorsTable from '@/components/modules/Dashboard/RecentVendors/RecentVendorsTable';
import { getEstadisticas } from '@/services/reporteService';
import { useToast } from '@/context/ToastContext';

const DashboardPage = () => {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getEstadisticas();
      setData(res);
    } catch (err) {
      console.error('Error al cargar datos del dashboard:', err);
      toast.error('Error al actualizar las métricas del panel');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Botón flotante o discreto para refrescar métricas */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Resumen General</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Métricas y actividad en tiempo real de Fiamas</p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          title="Actualizar datos del panel"
          className="p-2 border border-white/50 dark:border-white/10 bg-white/85 dark:bg-[#1A1F2E]/80 hover:bg-gray-50 dark:hover:bg-white/5 rounded-md text-gray-600 dark:text-gray-300 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Fila 1: cards + donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-1">
          <MetricCards resumen={data?.resumen} loading={loading} />
        </div>
        <div className="lg:col-span-2">
          <StatusChart resumen={data?.resumen} loading={loading} />
        </div>
      </div>

      {/* Fila 2: growth chart */}
      <GrowthChart
        crecimientoTiendas={data?.crecimientoTiendas || []}
        crecimientoTenderos={data?.crecimientoTenderos || []}
        loading={loading}
      />

      {/* Fila 3: tabla */}
      <RecentVendorsTable
        vendors={data?.ultimosTenderos || []}
        loading={loading}
      />
    </div>
  );
};

export default DashboardPage;