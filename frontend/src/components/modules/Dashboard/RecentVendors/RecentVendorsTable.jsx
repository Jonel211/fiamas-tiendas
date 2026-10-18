/**
 * RecentVendorsTable
 * Tabla con los últimos tenderos registrados en la plataforma.
 * Fondo transparente sin blur y datos reales de la base de datos.
 */

import { useState } from 'react';
import { Search, Users } from 'lucide-react';
import VendorsTableHeader from './VendorsTableHeader';
import VendorRow from './VendorRow';

const RecentVendorsTable = ({ vendors = [], loading }) => {
  const [search, setSearch] = useState('');

  const filtered = vendors.filter(
    (v) =>
      v.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      v.tienda?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white/85 dark:bg-[#1A1F2E]/80 rounded-md p-4 sm:p-6 shadow-sm transition-colors border border-white/50 dark:border-white/10">
      {/* Header: título + buscador */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-5">
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-slate-100">
            Últimos Tenderos Registrados
          </h3>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
            Tenderos registrados recientemente en la base de datos
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nombre o tienda..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-[13px] border border-white/40 dark:border-white/10 rounded-lg bg-white/50 dark:bg-white/5 text-gray-800 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#1D9492] w-full"
          />
        </div>
      </div>

      {/* Tabla con scroll horizontal en móvil */}
      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <table className="w-full min-w-[640px]">
          <VendorsTableHeader />
          <tbody>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i} className="border-b border-gray-100/60 dark:border-white/5">
                  <td colSpan={5} className="py-4 px-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full" />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400 dark:text-slate-500">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-30 text-[#1D9492]" />
                  <p className="text-xs">No hay tenderos registrados aún.</p>
                </td>
              </tr>
            ) : (
              filtered.map((v) => (
                <VendorRow key={v.id} {...v} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentVendorsTable;