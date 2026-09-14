import { apiRequest } from './api';

//Inicia sesión haciendo la llamada real a la API.
export const login = async ({ email, password, remember }) => {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (remember) {
    localStorage.setItem('fiamas_token', data.token);
  }
  sessionStorage.setItem('fiamas_token', data.token);
  localStorage.setItem('fiamas_user', JSON.stringify(data.user));

  return data;
};

//Cierra sesión.
export const logout = () => {
  localStorage.removeItem('fiamas_token');
  localStorage.removeItem('fiamas_user');
  sessionStorage.removeItem('fiamas_token');
};

//Obtiene el usuario autenticado actual (o null).
export const getCurrentUser = () => {
  const user = localStorage.getItem('fiamas_user');
  return user ? JSON.parse(user) : null;
};

//Verifica si hay sesión activa.
export const isAuthenticated = () => {
  return !!(
    localStorage.getItem('fiamas_token') ||
    sessionStorage.getItem('fiamas_token')
  );
};
