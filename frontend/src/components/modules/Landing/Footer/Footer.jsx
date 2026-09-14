/**
 * Footer
 * Pie de página navy con:
 * - Marca Fiadito.
 * - Links de navegación rápida.
 * - Link de acceso al panel privado (/login).
 * - Meta: "Proyecto académico — Tecsup, 2026".
 */

import { Link } from 'react-router-dom';
import { FOOTER_LINKS } from '@/constants/landingData';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <a href="#inicio" className="brand brand--footer">Fiadito</a>

        <ul className="footer__links">
          {FOOTER_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
          <li>
            <Link to="/login" className="footer__panel-link">
              Acceder al panel →
            </Link>
          </li>
        </ul>

        <p className="footer__meta">Proyecto académico — Tecsup, 2026</p>
      </div>
    </footer>
  );
};

export default Footer;