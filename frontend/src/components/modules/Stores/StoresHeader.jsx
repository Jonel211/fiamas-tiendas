import { RefreshCw } from 'lucide-react';
import iconTiendas from '@/assets/icons/sidebar/tiendas.png';

const StoresHeader = ({ onRefresh, loading }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
      <div className="flex items-center gap-3">
        <img src={iconTiendas} alt="Tiendas" className="w-9 h-9 sm:w-10 sm:h-10 object-contain flex-shrink-0" />
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Gestión de Tiendas</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Administra las tiendas, responsables y códigos QR vinculados.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onRefresh}
          title="Recargar datos"
          className="p-2 border border-white/50 dark:border-white/10 bg-white/85 dark:bg-[#1A1F2E]/80 hover:bg-gray-50 dark:hover:bg-white/5 rounded-md text-gray-600 dark:text-gray-300 transition-colors cursor-pointer shadow-sm"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
};

export default StoresHeader;