const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Petición HTTP genérica con manejo de errores
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;

  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  // Adjuntamos el token si existe
  const token = localStorage.getItem("fiamas_token");
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Credenciales incorrectas");
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("No se pudo conectar con el servidor", { cause: error });
    }
    throw error;
  }
};
