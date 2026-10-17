import { apiRequest } from './api';

let cachedTenderos = null;

export const getCachedTenderos = () => cachedTenderos;
export const clearTenderosCache = () => { cachedTenderos = null; };

// Obtener todos los tenderos (con caché en memoria para navegación instantánea)
export const getTenderos = async (forceRefresh = false) => {
  if (cachedTenderos && !forceRefresh) {
    return cachedTenderos;
  }
  const data = await apiRequest('/tenderos');
  cachedTenderos = data.tenderos || [];
  return cachedTenderos;
};

// Crear un tendero
export const createTendero = async (vendorData) => {
  cachedTenderos = null;
  const data = await apiRequest('/tenderos', {
    method: 'POST',
    body: JSON.stringify(vendorData),
  });
  return data.tendero;
};

// Actualizar un tendero
export const updateTendero = async (id, vendorData) => {
  cachedTenderos = null;
  const data = await apiRequest(`/tenderos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(vendorData),
  });
  return data.tendero;
};

// Alternar estado activo del tendero
export const toggleTenderoActivo = async (id) => {
  cachedTenderos = null;
  const data = await apiRequest(`/tenderos/toggle-activo/${id}`, {
    method: 'PUT',
  });
  return data;
};

// Eliminar un tendero
export const deleteTendero = async (id) => {
  cachedTenderos = null;
  const data = await apiRequest(`/tenderos/${id}`, {
    method: 'DELETE',
  });
  return data;
};
