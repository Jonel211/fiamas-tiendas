/**
 * SidebarLogo
 * Bloque superior del sidebar.
 * El logo + FIAMAS ocupan todo el ancho disponible del bloque.
 */

import logoIcon from '@/assets/icons/logo.png';

const SidebarLogo = ({ isExpanded }) => {
  return (
    <div className="border-b border-white/10">
      <div
        className={`flex items-center py-4 transition-all duration-300 ${
          isExpanded ? 'gap-3 px-5' : 'justify-center'
        }`}
      >
        <img
          src={logoIcon}
          alt="Fiamas"
          className="w-12 h-12 object-contain flex-shrink-0"
        />
        {isExpanded && (
          <span className="text-white font-extrabold text-[26px] tracking-[0.05em] whitespace-nowrap leading-none">
            FIAMAS
          </span>
        )}
      </div>
    </div>
  );
};

export default SidebarLogo;