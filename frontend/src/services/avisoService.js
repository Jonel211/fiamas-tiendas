import { apiRequest } from './api';

// Listar avisos
export const getAvisos = async ({ page = 1, limit = 20, buscar = '', prioridad = '' } = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (buscar) params.append('buscar', buscar);
  if (prioridad && prioridad !== 'todos') params.append('prioridad', prioridad);
  return await apiRequest(`/avisos?${params.toString()}`);
};

// Crear aviso
export const crearAviso = async ({ titulo, mensaje, prioridad, canales, tendero_id }) => {
  return await apiRequest('/avisos', {
    method: 'POST',
    body: JSON.stringify({ titulo, mensaje, prioridad, canales, tendero_id })
  });
};

// Eliminar aviso
export const eliminarAviso = async (id) => {
  return await apiRequest(`/avisos/${id}`, { method: 'DELETE' });
};
