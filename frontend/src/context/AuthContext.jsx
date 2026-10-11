import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, isAuthenticated, login as authServiceLogin, logout as authServiceLogout } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Inicialización sincrónica desde localStorage para que esté listo inmediatamente
  const [user, setUser] = useState(() => getCurrentUser());
  const [isAuth, setIsAuth] = useState(() => isAuthenticated());

  // Estado de carga para evitar parpadeos al verificar la sesión al recargar
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Pequeño delay para asegurar que el estado inicial se procesó correctamente
    const timer = setTimeout(() => {
      setLoading(false);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  const login = async (credentials) => {
    const data = await authServiceLogin(credentials);
    setUser(data.user || data.usuario);
    setIsAuth(true);
    return data;
  };

  const logout = () => {
    authServiceLogout();
    setUser(null);
    setIsAuth(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Cargando sesión...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: isAuth, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
