import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from './layouts/RootLayout/RootLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StoresPage from './pages/StoresPage';
import VendorsPage from './pages/VendorsPage';
import BackupsPage from './pages/BackupsPage';
import ReportsPage from './pages/ReportsPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/modules/Auth/ProtectedRoute';

// App principal
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/auth/login" replace />} />
          <Route path="/auth/login" element={<LoginPage />} />

          <Route path="/panel" element={<ProtectedRoute />}>
            <Route element={<RootLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="tiendas" element={<StoresPage />} />
              <Route path="tenderos" element={<VendorsPage />} />
              <Route path="backups" element={<BackupsPage />} />
              <Route path="reportes" element={<ReportsPage />} />
              <Route path="avisos" element={<AnnouncementsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
