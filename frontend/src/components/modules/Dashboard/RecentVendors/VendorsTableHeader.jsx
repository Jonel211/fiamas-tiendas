/**
 * VendorsTableHeader
 * Cabecera de la tabla de tenderos (solo el <thead>).
 */

const COLUMNS = [
  { label: 'Nombre', align: 'left' },
  { label: 'Tienda', align: 'left' },
  { label: 'Estado', align: 'left' },
  { label: 'Última Actividad', align: 'left' },
  { label: 'Acción', align: 'center' },
];

const VendorsTableHeader = () => {
  return (
    <thead>
      <tr className="border-b border-gray-200/60 dark:border-white/10">
        {COLUMNS.map((col) => (
          <th
            key={col.label}
            className={`text-${col.align} text-[11px] sm:text-[12px] font-medium text-gray-500 dark:text-slate-400 uppercase py-3 pr-4`}
          >
            {col.label}
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default VendorsTableHeader;