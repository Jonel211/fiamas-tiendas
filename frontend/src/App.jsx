import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from './layouts/RootLayout/RootLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StoresPage from './pages/StoresPage';
import VendorsPage from './pages/VendorsPage';
import BackupsPage from './pages/BackupsPage';
import ReportsPage from './pages/ReportsPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import SupportPage from './pages/SupportPage';
import ProfilePage from './pages/ProfilePage';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/modules/Auth/ProtectedRoute';

// App principal
function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Redirección por defecto al Login */}
            <Route path="/" element={<Navigate to="/auth/login" replace />} />
            <Route path="/login" element={<Navigate to="/auth/login" replace />} />

            {/* Login */}
            <Route path="/auth/login" element={<LoginPage />} />

            {/* Panel privado (protegido) */}
            <Route path="/panel" element={<ProtectedRoute />}>
              <Route element={<RootLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="tiendas" element={<StoresPage />} />
                <Route path="tenderos" element={<VendorsPage />} />
                <Route path="backups" element={<BackupsPage />} />
                <Route path="reportes" element={<ReportsPage />} />
                <Route path="avisos" element={<AnnouncementsPage />} />
                <Route path="soporte" element={<SupportPage />} />
                <Route path="configuracion" element={<ProfilePage />} />
              </Route>
            </Route>

            {/* Cualquier ruta desconocida → Login */}
            <Route path="*" element={<Navigate to="/auth/login" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;