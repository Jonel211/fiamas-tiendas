/**
 * DashboardPage
 * Página principal del panel administrativo.
 * Layout:
 * - Fila 1: cards apiladas (izq) + donut (der)
 * - Fila 2: growth chart
 * - Fila 3: tabla de tenderos
 */

import MetricCards from '@/components/modules/Dashboard/MetricCards/MetricCards';
import StatusChart from '@/components/modules/Dashboard/Charts/StatusChart';
import ChartsSection from '@/components/modules/Dashboard/Charts/ChartsSection';
import RecentVendorsTable from '@/components/modules/Dashboard/RecentVendors/RecentVendorsTable';

const DashboardPage = () => {
  return (
    <div className="space-y-6">
      {/* Fila 1: cards + donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <MetricCards />
        </div>
        <div className="lg:col-span-2">
          <StatusChart />
        </div>
      </div>

      {/* Fila 2: growth chart */}
      <ChartsSection />

      {/* Fila 3: tabla */}
      <RecentVendorsTable />
    </div>
  );
};

export default DashboardPage;