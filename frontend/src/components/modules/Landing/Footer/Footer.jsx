/**
 * Footer
 * Pie de página navy con:
 * - Marca Fiamas.
 * - Links de navegación rápida.
 * - Meta: "Proyecto académico — Tecsup, 2026".
 */

import { FOOTER_LINKS } from '@/constants/landingData';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <a href="#inicio" className="brand brand--footer">Fiamas</a>

        <ul className="footer__links">
          {FOOTER_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>

        <p className="footer__meta">Proyecto académico — Tecsup, 2026</p>
      </div>
    </footer>
  );
};

export default Footer;