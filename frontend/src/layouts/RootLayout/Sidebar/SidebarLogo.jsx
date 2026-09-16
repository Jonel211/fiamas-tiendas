/**
 * SidebarLogo
 * Bloque superior del sidebar: logo verde "F" + nombre "Fiamas" + subtítulo.
 */

const SidebarLogo = () => {
  return (
    <div className="px-6 py-6 border-b border-gray-100">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#1F8A4C]">
          <span className="text-white font-bold text-[14px]">F</span>
        </div>
        <div>
          <p className="text-[15px] font-semibold text-gray-900 leading-tight">Fiamas</p>
          <p className="text-[11px] text-gray-500 leading-tight">Admin Panel</p>
        </div>
      </div>
    </div>
  );
};

export default SidebarLogo;