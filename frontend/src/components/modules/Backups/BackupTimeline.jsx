// src/components/modules/Backups/BackupTimeline.jsx
import BackupTimelineItem from './BackupTimelineItem';

const backupData = [
  {
    id: 1,
    date: 'Hoy',
    time: '03:00 AM',
    size: '1.8 GB',
    status: 'success',
    type: 'Automático',
    user: null,
  },
  {
    id: 2,
    date: 'Ayer',
    time: '03:00 AM',
    size: '1.8 GB',
    status: 'success',
    type: 'Automático',
    user: null,
  },
  {
    id: 3,
    date: '16 Jun, 2024',
    time: '03:00 AM',
    size: '1.7 GB',
    status: 'success',
    type: 'Manual',
    user: 'Jonel',
  },
  {
    id: 4,
    date: '15 Jun, 2024',
    time: '03:00 AM',
    size: '1.9 GB',
    status: 'failed',
    type: 'Automático',
    user: null,
  },
  {
    id: 5,
    date: '14 Jun, 2024',
    time: '02:30 AM',
    size: '1.6 GB',
    status: 'in_progress',
    type: 'Manual',
    user: 'Alessandro',
  },
];

const BackupTimeline = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-semibold text-gray-700">Historial de respaldos</h3>
        <span className="text-xs text-gray-400">{backupData.length} registros</span>
      </div>
      <div className="space-y-0">
        {backupData.map((backup) => (
          <BackupTimelineItem key={backup.id} {...backup} />
        ))}
      </div>
    </div>
  );
};

export default BackupTimeline;