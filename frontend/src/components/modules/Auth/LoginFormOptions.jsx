/**
 * LoginFormOptions
 * Fila inferior del formulario: checkbox "Mantener sesión" + link "¿Olvidaste...?".
 */

const LoginFormOptions = ({ remember, onRememberChange }) => {
  return (
    <div className="flex items-center justify-between pt-0.5">
      <label className="flex items-center gap-1.5 cursor-pointer">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => onRememberChange(e.target.checked)}
          className="w-3.5 h-3.5 rounded cursor-pointer"
          style={{ accentColor: '#1D9492' }}
        />
        <span className="text-[12px]" style={{ color: '#5a6274' }}>
          Mantener sesión
        </span>
      </label>
      <a
        href="#"
        className="text-[12px] font-medium transition-colors"
        style={{ color: '#1D9492' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#167572')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#1D9492')}
      >
        ¿Olvidaste tu contraseña?
      </a>
    </div>
  );
};

export default LoginFormOptions;