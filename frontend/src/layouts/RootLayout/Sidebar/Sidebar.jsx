/**
 * Sidebar
 * Menú lateral con 3 estados:
 * - Pin: queda expandido hasta que hagas click afuera.
 * - Hover: al pasar el mouse por encima (colapsado), se expande.
 * - Colapsado: solo muestra íconos.
 */

import { useState, useRef, useCallback } from 'react';
import { useClickOutside } from '@/hooks/useClickOutside';
import SidebarLogo from './SidebarLogo';
import SidebarNav from './SidebarNav';
import SidebarUser from './SidebarUser';

const Sidebar = () => {
  const [isPinned, setIsPinned] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const sidebarRef = useRef(null);

  // Expandido si está pinneado o si el mouse está encima
  const isExpanded = isPinned || isHovered;

  const collapse = useCallback(() => setIsPinned(false), []);
  const pin = useCallback(() => setIsPinned(true), []);

  useClickOutside(sidebarRef, collapse);

  return (
    <aside
      ref={sidebarRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`flex-shrink-0 bg-[#181818] flex flex-col h-screen transition-all duration-300 ease-in-out ${
        isExpanded ? 'w-60' : 'w-20'
      }`}
    >
      <SidebarLogo isExpanded={isExpanded} />
      <SidebarNav isExpanded={isExpanded} onNavigate={pin} />
      <SidebarUser isExpanded={isExpanded} />
    </aside>
  );
};

export default Sidebar;