import { apiRequest } from './api';

// Obtener perfil del administrador
export const getAdminProfile = async () => {
  const data = await apiRequest('/auth/perfil');
  return data.usuario;
};

// Actualizar perfil del administrador
export const updateAdminProfile = async (profileData) => {
  const data = await apiRequest('/auth/perfil', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
  return data.usuario;
};
