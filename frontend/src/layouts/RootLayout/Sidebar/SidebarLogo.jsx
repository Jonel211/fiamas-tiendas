/**
 * SidebarLogo
 * Bloque superior del sidebar: logo + FIAMAS centrado.
 * En light el logo se ve oscuro; en dark se ve blanco.
 */

import logoIcon from '@/assets/icons/logo.png';

const SidebarLogo = ({ isExpanded }) => {
  return (
    <div className="py-5 border-b border-gray-100 dark:border-white/5 flex justify-center">
      <div className="flex items-center gap-2.5">
        <img
          src={logoIcon}
          alt="Fiamas"
          className="w-11 h-11 object-contain flex-shrink-0 brightness-0 opacity-80 dark:opacity-100 dark:invert"
        />
        {isExpanded && (
          <span className="text-[22px] font-extrabold tracking-[0.08em] whitespace-nowrap text-gray-800 dark:text-slate-100">
            FIAMAS
          </span>
        )}
      </div>
    </div>
  );
};

export default SidebarLogo;