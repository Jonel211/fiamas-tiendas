// src/constants/index.js

// Datos para las tarjetas del Dashboard
export const metricData = [
  {
    id: 1,
    title: 'Total Tiendas',
    value: '1,248',
    change: '+12.5%',
    changeType: 'positive', // 'positive' o 'negative'
    icon: 'Store',
    color: 'blue',
  },
  {
    id: 2,
    title: 'Total Tenderos',
    value: '3,842',
    change: '+8.2%',
    changeType: 'positive',
    icon: 'Users',
    color: 'green',
  },
  {
    id: 3,
    title: 'Fiados Activos',
    value: 'S/ 284,630',
    change: '-3.4%',
    changeType: 'negative',
    icon: 'DollarSign',
    color: 'purple',
  },
  {
    id: 4,
    title: 'Backups Recientes',
    value: '24',
    change: '+4.1%',
    changeType: 'positive',
    icon: 'HardDrive',
    color: 'orange',
  },
];

// Datos para la tabla de tenderos recientes
export const recentVendors = [
  { id: 1, name: 'María González', store: 'Bodega Don Pepe', date: '18 Jun, 2024' },
  { id: 2, name: 'Carlos Mendoza', store: 'Mercado Central', date: '17 Jun, 2024' },
  { id: 3, name: 'Ana Torres', store: 'Minimarket El Sol', date: '16 Jun, 2024' },
  { id: 4, name: 'Luis Ramirez', store: 'Abarrotes La Esquina', date: '15 Jun, 2024' },
];

// Datos para el gráfico de crecimiento de tiendas
export const storeGrowthData = [
  { month: 'Ene', stores: 120 },
  { month: 'Feb', stores: 145 },
  { month: 'Mar', stores: 180 },
  { month: 'Abr', stores: 210 },
  { month: 'May', stores: 240 },
  { month: 'Jun', stores: 280 },
];

// Datos para el gráfico de estados de pago
export const paymentStatusData = [
  { name: 'Pagado', value: 78 },
  { name: 'Pendiente', value: 22 },
];

// Colores para los gráficos
export const COLORS = ['#4F46E5', '#F59E0B'];