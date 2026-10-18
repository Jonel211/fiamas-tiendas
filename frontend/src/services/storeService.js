import { apiRequest } from './api';

let cachedTiendas = null;

export const getCachedTiendas = () => cachedTiendas;
export const clearTiendasCache = () => { cachedTiendas = null; };

// Obtener todas las tiendas (con caché en memoria para navegación instantánea)
export const getTiendas = async (forceRefresh = false) => {
  if (cachedTiendas && !forceRefresh) {
    return cachedTiendas;
  }
  const data = await apiRequest('/tiendas');
  cachedTiendas = data.tiendas || [];
  return cachedTiendas;
};

// Crear una tienda
export const createTienda = async (storeData) => {
  cachedTiendas = null;
  const data = await apiRequest('/tiendas', {
    method: 'POST',
    body: JSON.stringify(storeData),
  });
  return data.tienda;
};

// Actualizar una tienda
export const updateTienda = async (id, storeData) => {
  cachedTiendas = null;
  const data = await apiRequest(`/tiendas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(storeData),
  });
  return data.tienda;
};

// Alternar estado activo de una tienda
export const toggleTiendaActivo = async (id) => {
  cachedTiendas = null;
  const data = await apiRequest(`/tiendas/toggle-activo/${id}`, {
    method: 'PUT',
  });
  return data;
};

// Alternar estado de QR de una tienda
export const toggleTiendaQR = async (id, activo) => {
  cachedTiendas = null;
  const data = await apiRequest(`/tiendas/toggle-qr/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ activo }),
  });
  return data;
};

// Generar / Regenerar token QR
export const generarTiendaQR = async (id) => {
  cachedTiendas = null;
  const data = await apiRequest(`/tiendas/generar-qr/${id}`, {
    method: 'POST',
  });
  return data;
};

// Eliminar una tienda
export const deleteTienda = async (id) => {
  cachedTiendas = null;
  const data = await apiRequest(`/tiendas/${id}`, {
    method: 'DELETE',
  });
  return data;
};
