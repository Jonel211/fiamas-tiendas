// src/components/modules/Backups/BackupStats.jsx
import { CheckCircle, HardDrive, Clock, AlertCircle } from 'lucide-react';

const stats = [
  {
    id: 1,
    title: 'Último backup exitoso',
    value: 'Hoy, 03:00 AM',
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
  },
  {
    id: 2,
    title: 'Total de backups',
    value: '142',
    icon: HardDrive,
    color: 'text-brand-600',
    bgColor: 'bg-brand-50',
  },
  {
    id: 3,
    title: 'Espacio ocupado',
    value: '24.8 GB',
    icon: Clock,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    id: 4,
    title: 'Fallos en el mes',
    value: '2',
    icon: AlertCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
  },
];

const BackupStats = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.id}
          className="relative bg-white rounded-xl shadow-sm border border-gray-100 p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-1 group"
        >
          {/* Borde superior gradiente */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-600 to-purple-500 rounded-t-xl" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{stat.value}</p>
            </div>
            <div className={`p-2 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BackupStats;