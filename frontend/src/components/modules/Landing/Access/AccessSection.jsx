/**
 * CtaSection
 * Última sección antes del footer (id="contacto").
 * Tarjeta navy grande con:
 * - Anillos decorativos arriba.
 * - Eyebrow "Acceso anticipado".
 * - Título, subtítulo y formulario de email.
 */

import AccessForm from './AccessForm';
import './AccessSection.css';

const AccessSection = () => {
  return (
    <section className="cta" id="contacto">
      <div className="container">
        <div className="cta__card" data-reveal>
          <div className="cta__rings" aria-hidden="true">
            {Array.from({ length: 9 }).map((_, i) => <span key={i} />)}
          </div>

          <div className="cta__body">
            <span className="cta__eyebrow">Acceso anticipado</span>
            <h2>¿Listo para dejar el cuaderno de fiados?</h2>
            <p>Déjanos tu correo y te avisamos apenas Fiadito esté listo para tu tienda.</p>

            <AccessForm />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AccessSection;