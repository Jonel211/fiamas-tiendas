/**
 * SidebarLogo
 * Bloque superior del sidebar: logo + FIAMAS centrado.
 * En light el logo se ve oscuro; en dark se ve blanco.
 */

import { Link } from 'react-router-dom';
import logoIcon from '@/assets/icons/logo.png';

const SidebarLogo = ({ isExpanded }) => {
  return (
    <div className="py-5 border-b border-gray-100 dark:border-white/5 flex justify-center relative group">
      <Link to="/panel" className="flex items-center gap-2.5 transition-transform hover:scale-105 active:scale-95">
        <img
          src={logoIcon}
          alt="Fiamas"
          className="w-11 h-11 object-contain flex-shrink-0 brightness-0 opacity-80 dark:opacity-100 dark:invert"
        />
        <span className={`inline-block text-[22px] font-extrabold tracking-[0.08em] whitespace-nowrap text-gray-800 dark:text-slate-100 overflow-hidden transition-all duration-1000 ease-in-out ${isExpanded ? 'max-w-[200px] opacity-100' : 'max-w-0 opacity-0'}`}>
          FIAMAS
        </span>
      </Link>
    </div>
  );
};

export default SidebarLogo;