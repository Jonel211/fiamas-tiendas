/**
 * FeatureIcon
 * Renderiza el SVG del ícono según el nombre recibido.
 * Se usa dentro de cada FeatureCard.
 * Íconos disponibles: list, box, grid, chart, user, shield.
 */

const ICONS = {
  list: (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M4 6h16M4 12h16M4 18h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  box: (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M4 8l8-4 8 4-8 4-8-4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M4 8v8l8 4 8-4V8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  ),
  grid: (
    <svg viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="7" height="16" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="4" width="7" height="10" rx="1.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M4 19V9M11 19V4M18 19v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="2" />
      <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M12 3l7 3v5c0 4.5-3 7.7-7 10-4-2.3-7-5.5-7-10V6l7-3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  ),
};

const FeatureIcon = ({ name }) => ICONS[name] || null;

export default FeatureIcon;