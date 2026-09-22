/**
 * LoginFormHeader
 * Encabezado del formulario: logo + nombre Fiamas + título + subtítulo.
 */

import logoIcon from '@/assets/icons/logo.png';

const LoginFormHeader = () => {
  return (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-7">
        <img
          src={logoIcon}
          alt="Fiamas"
          className="w-9 h-9 object-contain flex-shrink-0 brightness-0 dark:invert"
        />
        <span className="font-semibold text-[15px]" style={{ color: '#0F172A' }}>
          Fiamas
        </span>
      </div>

      {/* Título */}
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold tracking-tight mb-1.5" style={{ color: '#0F172A' }}>
          Iniciar sesión
        </h1>
        <p className="text-[12.5px]" style={{ color: '#5a6274' }}>
          Ingresa tus credenciales para continuar.
        </p>
      </div>
    </>
  );
};

export default LoginFormHeader;