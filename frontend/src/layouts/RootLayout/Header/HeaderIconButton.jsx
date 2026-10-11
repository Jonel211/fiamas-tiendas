/**
 * HeaderIconButton
 * Botón circular con ícono para el Header.
 * - Los íconos comunes se ven blancos en dark mode.
 * - Si es logo (isLogo), se ve oscuro en light y blanco en dark.
 * - Si tiene tintColor, el ícono se colorea con ese color usando mask.
 * Tamaños responsive: más pequeños en móvil, más grandes en desktop.
 */

const HeaderIconButton = ({ icon, label, onClick, isLogo = false, tintColor }) => {
  const iconClass = isLogo
    ? 'brightness-0 opacity-80 dark:opacity-100 dark:invert'
    : 'dark:brightness-0 dark:invert';

  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors flex items-center justify-center flex-shrink-0"
    >
      {tintColor ? (
        <span
          className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7"
          style={{
            WebkitMaskImage: `url(${icon})`,
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskImage: `url(${icon})`,
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
            backgroundColor: tintColor,
          }}
        />
      ) : (
        <img
          src={icon}
          alt=""
          className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 object-contain ${iconClass}`}
        />
      )}
    </button>
  );
};

export default HeaderIconButton;