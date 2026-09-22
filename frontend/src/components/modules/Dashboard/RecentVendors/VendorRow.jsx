/**
 * VendorRow
 * Fila individual de la tabla de tenderos.
 */

import { Eye, Pencil } from 'lucide-react';
import { STATUS_STYLES } from './vendorsData';

const VendorRow = ({ nombre, tienda, estado, actividad }) => {
  const s = STATUS_STYLES[estado];

  return (
    <tr className="border-b border-gray-100/60 dark:border-white/5 hover:bg-white/20 dark:hover:bg-white/5 transition-colors">
      <td className="py-3 text-[12.5px] sm:text-[13.5px] font-medium text-gray-800 dark:text-slate-100 whitespace-nowrap pr-4">
        {nombre}
      </td>
      <td className="py-3 text-[12.5px] sm:text-[13.5px] text-gray-600 dark:text-slate-400 whitespace-nowrap pr-4">
        {tienda}
      </td>
      <td className="py-3 pr-4">
        <span
          className="text-[10px] sm:text-[11px] font-semibold px-2 sm:px-2.5 py-1 rounded-full whitespace-nowrap"
          style={{ backgroundColor: s.bg, color: s.color }}
        >
          {estado}
        </span>
      </td>
      <td className="py-3 text-[12px] sm:text-[13px] text-gray-500 dark:text-slate-500 whitespace-nowrap pr-4">
        {actividad}
      </td>
      <td className="py-3">
        <div className="flex items-center justify-center gap-1 sm:gap-2">
          <button className="p-1.5 text-[#1D9492] hover:bg-[#1D9492]/10 rounded-md transition-colors" title="Ver">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-[#1D9492] hover:bg-[#1D9492]/10 rounded-md transition-colors" title="Editar">
            <Pencil className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default VendorRow;