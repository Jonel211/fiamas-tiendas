import { apiRequest } from './api';

// Inicia sesión haciendo la llamada real a la API.
export const login = async ({ email, password, remember }) => {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  // sessionStorage NO se comparte entre pestañas, por eso se perdía la sesión.
  localStorage.setItem('fiamas_token', data.token);
  localStorage.setItem('fiamas_user', JSON.stringify(data.user || data.usuario));

  return data;
};

// Cierra sesión
export const logout = () => {
  localStorage.removeItem('fiamas_token');
  localStorage.removeItem('fiamas_user');
  sessionStorage.removeItem('fiamas_token'); // Limpieza por seguridad
};

// Obtiene el usuario autenticado actual (o null).
export const getCurrentUser = () => {
  const user = localStorage.getItem('fiamas_user');
  if (!user || user === 'undefined' || user === 'null') return null;
  try {
    return JSON.parse(user);
  } catch (e) {
    return null;
  }
};

// Verifica si hay sesión activa.
export const isAuthenticated = () => {
  //  Solo verificamos localStorage, ya que es el que persiste entre pestañas
  return !!localStorage.getItem('fiamas_token');
};
