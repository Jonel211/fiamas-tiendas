/**
 * DashboardPage
 * Layout:
 * - Móvil: cards apiladas + donut debajo, todo full width.
 * - Desktop: cards (1/3) + donut (2/3), luego growth chart y tabla.
 */

import MetricCards from '@/components/modules/Dashboard/MetricCards/MetricCards';
import StatusChart from '@/components/modules/Dashboard/Charts/Status/StatusChart';
import GrowthChart from '@/components/modules/Dashboard/Charts/Growth/GrowthChart';
import RecentVendorsTable from '@/components/modules/Dashboard/RecentVendors/RecentVendorsTable';

const DashboardPage = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Fila 1: cards + donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-1">
          <MetricCards />
        </div>
        <div className="lg:col-span-2">
          <StatusChart />
        </div>
      </div>

      {/* Fila 2: growth chart */}
      <GrowthChart />

      {/* Fila 3: tabla */}
      <RecentVendorsTable />
    </div>
  );
};

export default DashboardPage;