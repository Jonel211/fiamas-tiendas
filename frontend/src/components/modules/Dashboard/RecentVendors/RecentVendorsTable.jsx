/**
 * RecentVendorsTable
 * Tabla con los últimos tenderos registrados.
 * Incluye: búsqueda, badges de estado y acciones (ver/editar).
 */

import { useState } from 'react';
import { Search, Eye, Pencil } from 'lucide-react';

const VENDORS = [
  { id: 1, nombre: 'María González', tienda: 'Bodega Don Pepe', estado: 'Activo', actividad: 'hace 2 horas' },
  { id: 2, nombre: 'Carlos Mendoza', tienda: 'Mercado Central', estado: 'Pendiente', actividad: '15 Jun, 2024' },
  { id: 3, nombre: 'Carlos Rojas', tienda: 'Mercado Central', estado: 'Pendiente', actividad: '17 Jun, 2024' },
  { id: 4, nombre: 'Ana Torres', tienda: 'Minimarket El Sol', estado: 'Activo', actividad: '18 Jun, 2024' },
  { id: 5, nombre: 'Luis Ramírez', tienda: 'Abarrotes La Esquina', estado: 'Pendiente', actividad: '15 Jun, 2024' },
  { id: 6, nombre: 'María Semoriz', tienda: 'Mercado Central', estado: 'Pendiente', actividad: '18 Jun, 2024' },
  { id: 7, nombre: 'Luis Ramírez', tienda: 'Abarrotes La Esquina', estado: 'Activo', actividad: '15 Jun, 2024' },
];

const STATUS_STYLES = {
  Activo: { bg: 'rgba(31, 138, 76, 0.12)', color: '#1F8A4C' },
  Pendiente: { bg: 'rgba(242, 201, 76, 0.2)', color: '#a37d00' },
};

const RecentVendorsTable = () => {
  const [search, setSearch] = useState('');

  const filtered = VENDORS.filter(
    (v) =>
      v.nombre.toLowerCase().includes(search.toLowerCase()) ||
      v.tienda.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <h3 className="text-base font-semibold text-gray-800">
          Últimos Tenderos Registrados
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1F8A4C] focus:border-[#1F8A4C] w-full sm:w-64"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-[12px] font-medium text-gray-500 uppercase py-3">Nombre</th>
              <th className="text-left text-[12px] font-medium text-gray-500 uppercase py-3">Tienda</th>
              <th className="text-left text-[12px] font-medium text-gray-500 uppercase py-3">Estado</th>
              <th className="text-left text-[12px] font-medium text-gray-500 uppercase py-3">Última Actividad</th>
              <th className="text-center text-[12px] font-medium text-gray-500 uppercase py-3">Acción</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => {
              const s = STATUS_STYLES[v.estado];
              return (
                <tr key={v.id} className="border-b border-gray-100 hover:bg-gray-50/70 transition-colors">
                  <td className="py-3.5 text-[13.5px] font-medium text-gray-800">{v.nombre}</td>
                  <td className="py-3.5 text-[13.5px] text-gray-600">{v.tienda}</td>
                  <td className="py-3.5">
                    <span
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: s.bg, color: s.color }}
                    >
                      {v.estado}
                    </span>
                  </td>
                  <td className="py-3.5 text-[13px] text-gray-500">{v.actividad}</td>
                  <td className="py-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1.5 text-[#1F8A4C] hover:bg-[#1F8A4C]/10 rounded-md transition-colors" title="Ver">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-[#1F8A4C] hover:bg-[#1F8A4C]/10 rounded-md transition-colors" title="Editar">
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentVendorsTable;