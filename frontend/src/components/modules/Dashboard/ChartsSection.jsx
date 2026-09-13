// src/components/modules/Dashboard/ChartsSection.jsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { storeGrowthData, paymentStatusData, COLORS } from '../../../constants';
import Card from '../../ui/Card';

const ChartsSection = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de barras */}
      <Card>
        <div className="p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Crecimiento de Tiendas</h3>
          <p className="text-xs text-gray-400 mb-4">Últimos 6 meses</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={storeGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="stores" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Gráfico de anillo (doughnut) */}
      <Card>
        <div className="p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Estados de Pago de Fiados</h3>
          <p className="text-xs text-gray-400 mb-4">Distribución actual</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-center">
            <p className="text-sm font-medium text-gray-600">Total: S/ 365,900</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChartsSection;