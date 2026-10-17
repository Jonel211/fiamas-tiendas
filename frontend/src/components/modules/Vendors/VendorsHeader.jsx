import { RefreshCw } from 'lucide-react';
import iconTenderos from '@/assets/icons/sidebar/tenderos.png';

const VendorsHeader = ({ onRefresh, loading }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
      <div className="flex items-center gap-3">
        <img src={iconTenderos} alt="Tenderos" className="w-9 h-9 sm:w-10 sm:h-10 object-contain flex-shrink-0" />
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Gestión de Tenderos</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Administra las cuentas de tenderos registradas en el sistema.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onRefresh}
          title="Recargar datos"
          className="p-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
};

export default VendorsHeader;