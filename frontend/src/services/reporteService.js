import { apiRequest } from './api';

// Obtener estadísticas generales (tiendas, tenderos, gráficos)
export const getEstadisticas = async () => {
  return await apiRequest('/reportes/estadisticas');
};
