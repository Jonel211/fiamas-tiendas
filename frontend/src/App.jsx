// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import RootLayout from './layouts/RootLayout/RootLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StoresPage from './pages/StoresPage';
import VendorsPage from './pages/VendorsPage';
import BackupsPage from './pages/BackupsPage';
import ReportsPage from './pages/ReportsPage';
import AnnouncementsPage from './pages/AnnouncementsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing pública - raíz del sitio */}
        <Route path="/" element={<LandingPage />} />

        {/* Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Panel privado (con sidebar) */}
        <Route path="/panel" element={<RootLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="tiendas" element={<StoresPage />} />
          <Route path="tenderos" element={<VendorsPage />} />
          <Route path="backups" element={<BackupsPage />} />
          <Route path="reportes" element={<ReportsPage />} />
          <Route path="avisos" element={<AnnouncementsPage />} />
        </Route>

        {/* Cualquier ruta desconocida → landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;