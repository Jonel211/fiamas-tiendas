/**
 * LoginForm
 * Formulario de inicio de sesión.
 * Compuesto por:
 * - LoginFormHeader (logo + título)
 * - FormField (inputs)
 * - LoginFormOptions (remember + forgot)
 * - LoginSubmitButton (botón)
 */

import { Mail, Lock } from 'lucide-react';
import { useLoginForm } from '@/hooks/useLoginForm';
import FormField from '../../ui/FormField';
import LoginFormHeader from './LoginFormHeader';
import LoginFormOptions from './LoginFormOptions';
import LoginSubmitButton from './LoginSubmitButton';

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
        backgroundColor: 'rgba(255, 255, 255, 0.35)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(29, 148, 146, 0.4)',
        boxShadow: '0 12px 40px -15px rgba(15, 61, 60, 0.15)',
      }}
    >
      <LoginFormHeader />

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

        <LoginFormOptions
          remember={form.remember}
          onRememberChange={toggleRemember}
        />

        <LoginSubmitButton isSubmitting={isSubmitting} />

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