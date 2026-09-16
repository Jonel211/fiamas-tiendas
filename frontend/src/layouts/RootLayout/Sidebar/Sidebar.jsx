/**
 * Sidebar
 * Contenedor del menú lateral del panel.
 * Delega la UI a 3 subcomponentes: Logo, Nav y User.
 */

import SidebarLogo from './SidebarLogo';
import SidebarNav from './SidebarNav';
import SidebarUser from './SidebarUser';

const Sidebar = () => {
  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-screen">
      <SidebarLogo />
      <SidebarNav />
      <SidebarUser />
    </aside>
  );
};

export default Sidebar;