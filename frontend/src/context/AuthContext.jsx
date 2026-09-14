import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, isAuthenticated, login as authServiceLogin, logout as authServiceLogout } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage on initial load
    if (isAuthenticated()) {
      setUser(getCurrentUser());
      setIsAuth(true);
    }
    setLoading(false);
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

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: isAuth, login, logout, loading }}>
      {loading ? <div>Cargando...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
