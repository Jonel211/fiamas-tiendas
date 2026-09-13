// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from './layouts/RootLayout/RootLayout';
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
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/panel" element={<RootLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="tiendas" element={<StoresPage />} />
          <Route path="tenderos" element={<VendorsPage />} />
          <Route path="backups" element={<BackupsPage />} />
          <Route path="reportes" element={<ReportsPage />} />
          <Route path="avisos" element={<AnnouncementsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;