// src/components/modules/Dashboard/MetricCardItem.jsx
import * as Icons from 'lucide-react';
import Card from '../../ui/Card';

const MetricCardItem = ({ title, value, change, changeType, icon, color }) => {
  const IconComponent = Icons[icon] || Icons.HelpCircle;
  const colorMap = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <Card hover className="relative overflow-hidden">
      {/* Borde superior con gradiente */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colorMap[color]}`} />
      
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</p>
          </div>
          <div className={`p-3 rounded-full bg-${color}-50`}>
            <IconComponent className={`w-6 h-6 text-${color}-600`} />
          </div>
        </div>
        
        <div className="mt-4 flex items-center gap-2">
          <span
            className={`text-xs font-semibold ${
              changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {change}
          </span>
          <span className="text-xs text-gray-500">vs. mes anterior</span>
        </div>
      </div>
    </Card>
  );
};

export default MetricCardItem;