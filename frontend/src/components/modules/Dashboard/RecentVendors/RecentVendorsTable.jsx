/**
 * RecentVendorsTable
 * Tabla con los últimos tenderos registrados.
 * Fondo transparente sin blur.
 * En móvil: scroll horizontal.
 *
 * Compuesto por:
 * - VendorsTableHeader (thead)
 * - VendorRow (tr por cada tendero)
 * - vendorsData (datos + estilos)
 */

import { useState } from 'react';
import { Search } from 'lucide-react';
import VendorsTableHeader from './VendorsTableHeader';
import VendorRow from './VendorRow';
import { VENDORS } from './vendorsData';

const RecentVendorsTable = () => {
  const [search, setSearch] = useState('');

  const filtered = VENDORS.filter(
    (v) =>
      v.nombre.toLowerCase().includes(search.toLowerCase()) ||
      v.tienda.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white/85 dark:bg-[#1A1F2E]/80 rounded-md p-4 sm:p-6 shadow-sm transition-colors border border-white/50 dark:border-white/10">
      {/* Header: título + buscador */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-5">
        <h3 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-slate-100">
          Últimos Tenderos Registrados
        </h3>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Buscar"
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
            {filtered.map((v) => (
              <VendorRow key={v.id} {...v} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentVendorsTable;