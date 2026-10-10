/**
 * CtaForm
 * Formulario de acceso anticipado dentro de la sección CTA.
 * Solo tiene un input de email + botón "Avísame" + nota de feedback.
 */

import { useContactForm } from '@/hooks/useContactForm';
import './AccessForm.css';

const AccessForm = () => {
  const { email, setEmail, note, handleSubmit } = useContactForm();

  return (
    <>
      <form className="cta__form" onSubmit={handleSubmit} noValidate>
        <div className="cta__field">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.8" />
            <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <input
            type="email"
            required
            placeholder="tucorreo@ejemplo.com"
            aria-label="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="btn btn--gold btn--sm">Avísame</button>
        </div>
      </form>

      <p className="cta__note" role="status" aria-live="polite">{note}</p>
      <p className="cta__hint">Sin spam. Solo te escribimos cuando esté listo.</p>
    </>
  );
};

export default AccessForm;