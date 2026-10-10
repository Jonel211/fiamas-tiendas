/**
 * Navbar
 * Barra de navegación sticky superior.
 * Incluye: logo Fiadito, links de navegación, CTA "Solicitar acceso"
 * y menú hamburguesa en móvil.
 */

import { NAV_LINKS } from '@/constants/landingData';
import { useLandingNav } from '@/hooks/useLandingNav';
import './Navbar.css';

const Navbar = () => {
  const { isOpen, activeId, toggle, close } = useLandingNav();

  return (
    <header className={`navbar ${isOpen ? 'nav-open' : ''}`} id="navbar">
      <div className="container navbar__inner">
        <a href="#inicio" className="brand">
          <span className="brand__mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="3" width="24" height="26" rx="3" fill="#2B2D42" />
              <path d="M9 10H23" stroke="#FFF3D6" strokeWidth="2" strokeLinecap="round" />
              <path d="M9 15H19" stroke="#FFF3D6" strokeWidth="2" strokeLinecap="round" />
              <path d="M9 20L12.2 23L19 16.5" stroke="#F2C94C" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span>Fiadito</span>
        </a>

        <nav className="nav" id="nav">
          <ul className="nav__list">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={`nav__link ${activeId === link.href.replace('#', '') ? 'active' : ''}`}
                  onClick={close}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="nav__list-cta">
              <a href="#contacto" className="btn btn--primary btn--sm" onClick={close}>
                Solicitar acceso
              </a>
            </li>
          </ul>
        </nav>

        <a href="#contacto" className="btn btn--primary btn--sm navbar__cta">
          Solicitar acceso
        </a>

        <button
          className="nav__toggle"
          aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={isOpen}
          aria-controls="nav"
          onClick={toggle}
        >
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;