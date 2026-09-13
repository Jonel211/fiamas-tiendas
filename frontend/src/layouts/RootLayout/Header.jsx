// src/layouts/RootLayout/Header.jsx
import { Search, Bell, Moon, Sun } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 p-4 flex items-center justify-between">
      {/* Buscador */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Buscar en el panel..."
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
        />
      </div>

      {/* Acciones de usuario */}
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Moon size={20} className="text-gray-600" />
        </button>
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
          <span className="text-xs font-bold text-white">JD</span>
        </div>
      </div>
    </header>
  );
};

export default Header;