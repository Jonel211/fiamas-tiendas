/**
 * vendorsData
 * Datos estáticos y estilos de la tabla de últimos tenderos.
 */

export const VENDORS = [
  { id: 1, nombre: 'María González', tienda: 'Bodega Don Pepe', estado: 'Activo', actividad: 'hace 2 horas' },
  { id: 2, nombre: 'Carlos Mendoza', tienda: 'Mercado Central', estado: 'Pendiente', actividad: '15 Jun, 2024' },
  { id: 3, nombre: 'Carlos Rojas', tienda: 'Mercado Central', estado: 'Pendiente', actividad: '17 Jun, 2024' },
  { id: 4, nombre: 'Ana Torres', tienda: 'Minimarket El Sol', estado: 'Activo', actividad: '18 Jun, 2024' },
  { id: 5, nombre: 'Luis Ramírez', tienda: 'Abarrotes La Esquina', estado: 'Pendiente', actividad: '15 Jun, 2024' },
];

export const STATUS_STYLES = {
  Activo: { bg: 'rgba(42, 157, 143, 0.15)', color: '#1D9492' },
  Pendiente: { bg: 'rgba(233, 185, 73, 0.2)', color: '#a37d00' },
};