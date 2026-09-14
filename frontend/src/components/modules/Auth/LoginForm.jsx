import { Mail, Lock } from 'lucide-react';
import { useLoginForm } from '../../../hooks/useLoginForm';
import FormField from '../../ui/FormField';

const LoginForm = () => {
  const {
    form,
    errors,
    serverError,
    isSubmitting,
    handleChange,
    handleSubmit,
    toggleRemember,
  } = useLoginForm();

  return (
    <div
      className="w-full max-w-[340px] rounded-2xl px-7 py-8"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(31, 138, 76, 0.35)',
        boxShadow: '0 12px 40px -15px rgba(15, 61, 36, 0.12)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-7">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: '#1F8A4C' }}
        >
          <span className="text-white font-bold text-[13px]">F</span>
        </div>
        <span className="font-semibold text-[15px]" style={{ color: '#0f3d24' }}>
          Fiamas
        </span>
      </div>

      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold tracking-tight mb-1.5" style={{ color: '#0f3d24' }}>
          Iniciar sesión
        </h1>
        <p className="text-[12.5px]" style={{ color: '#5a6274' }}>
          Ingresa tus credenciales para continuar.
        </p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        <FormField
          label="Correo electrónico"
          name="email"
          type="email"
          placeholder="tu@fiamas.com"
          icon={Mail}
          value={form.email}
          onChange={handleChange}
          error={errors.email}
        />

        <FormField
          label="Contraseña"
          name="password"
          type="password"
          placeholder="Ingresa tu contraseña"
          icon={Lock}
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />

        {/* Remember + Forgot */}
        <div className="flex items-center justify-between pt-0.5">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.remember}
              onChange={(e) => toggleRemember(e.target.checked)}
              className="w-3.5 h-3.5 rounded cursor-pointer"
              style={{ accentColor: '#1F8A4C' }}
            />
            <span className="text-[12px]" style={{ color: '#5a6274' }}>
              Mantener sesión
            </span>
          </label>
          <a
            href="#"
            className="text-[12px] font-medium transition-colors"
            style={{ color: '#1F8A4C' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#0f3d24')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#1F8A4C')}
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        {/* Botón */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full text-white text-[13px] font-medium py-2.5 rounded-lg transition-all mt-1 disabled:opacity-70 disabled:cursor-not-allowed"
          style={{
            backgroundColor: '#1F8A4C',
            boxShadow: '0 6px 16px -6px rgba(31,138,76,0.5)',
          }}
          onMouseEnter={(e) => {
            if (isSubmitting) return;
            e.currentTarget.style.backgroundColor = '#1a7040';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#1F8A4C';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
        </button>

        {/* Error del servidor */}
        {serverError && (
          <p
            className="text-[12px] text-center mt-2 px-3 py-2 rounded-md"
            style={{ color: '#E63946', backgroundColor: 'rgba(230, 57, 70, 0.1)' }}
          >
            {serverError}
          </p>
        )}
      </form>

      <p className="text-[11px] text-center mt-6" style={{ color: '#7a8295' }}>
        © 2024 Fiamas · Plataforma SaaS
      </p>
    </div>
  );
};

export default LoginForm;
