/**
 * RootLayout
 * Layout principal del panel administrativo.
 * Compone: Sidebar (izq) + Header (arriba) + contenido (Outlet).
 */

import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar/Sidebar';
import Header from './Header/Header';

const RootLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default RootLayout;