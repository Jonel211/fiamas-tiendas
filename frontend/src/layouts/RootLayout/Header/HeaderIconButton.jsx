/**
 * HeaderIconButton
 * Botón circular con ícono para el Header.
 * Reutilizable para notificaciones, modo oscuro, modo claro y perfil.
 */

const HeaderIconButton = ({ icon, label, onClick }) => {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="w-11 h-11 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center"
    >
      <img src={icon} alt="" className="w-7 h-7 object-contain" />
    </button>
  );
};

export default HeaderIconButton;