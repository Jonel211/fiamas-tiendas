import { apiRequest } from './api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Obtener historial de backups
export const getBackups = async ({ page = 1, limit = 10, buscar = '', estado = '' } = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (buscar) params.append('buscar', buscar);
  if (estado) params.append('estado', estado);
  return await apiRequest(`/backups?${params.toString()}`);
};

// Obtener estadísticas de backup
export const getBackupStats = async () => {
  return await apiRequest('/backups/stats');
};

// Generar backup manual
export const generarBackup = async () => {
  return await apiRequest('/backups/generar', { method: 'POST' });
};

// Descargar archivo de backup real
export const downloadBackup = async (filename) => {
  const token = localStorage.getItem('fiamas_token');
  const response = await fetch(`${API_URL}/backups/download/${encodeURIComponent(filename)}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  if (!response.ok) {
    throw new Error('Error al descargar el archivo de copia de seguridad');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

// Eliminar archivo de backup
export const deleteBackup = async (filename) => {
  return await apiRequest(`/backups/${encodeURIComponent(filename)}`, { method: 'DELETE' });
};

// Restaurar archivo de backup
export const restoreBackup = async (filename) => {
  return await apiRequest(`/backups/restaurar/${encodeURIComponent(filename)}`, { method: 'POST' });
};

// Importar archivo de backup externo (.json)
export const importBackup = async ({ filename, content, restaurarAhora = false }) => {
  return await apiRequest('/backups/importar', {
    method: 'POST',
    body: JSON.stringify({ filename, content, restaurarAhora }),
  });
};


