// src/pages/DashboardPage.jsx
import MetricCards from '../components/modules/Dashboard/MetricCards';
import ChartsSection from '../components/modules/Dashboard/ChartsSection';
import RecentVendorsTable from '../components/modules/Dashboard/RecentVendorsTable';

const DashboardPage = () => {
  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Vista operativa de tu plataforma Fiamas.</p>
      </div>

      {/* Tarjetas de métricas */}
      <MetricCards />

      {/* Gráficos */}
      <ChartsSection />

      {/* Tabla de tenderos recientes */}
      <RecentVendorsTable />
    </div>
  );
};

export default DashboardPage;