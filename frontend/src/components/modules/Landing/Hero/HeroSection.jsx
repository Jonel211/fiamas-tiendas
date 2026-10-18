/**
 * HeroSection
 * Sección principal (primera pantalla):
 * - Fondo navy con anillos decorativos arriba.
 * - Título grande, subtítulo y botones de acción.
 * - Mockup de teléfono a la derecha.
 */

import PhoneMockup from './PhoneMockup';
import './HeroSection.css';

const HeroSection = () => {
  return (
    <section className="hero" id="inicio">
      <div className="hero__rings" aria-hidden="true">
        {Array.from({ length: 18 }).map((_, i) => <span key={i} />)}
      </div>

      <div className="container hero__inner">
        <div className="hero__content">
          <h1 className="hero__title">
            Tu libreta de fiados,<br />
            ahora en el bolsillo de tu tienda
          </h1>
          <p className="hero__subtitle">
            Fiadito lleva el control de lo que tus clientes te deben, sin cuadernos
            que se mojan, se pierden o se les acaban las hojas.
          </p>
          <div className="hero__actions">
            <a href="#contacto" className="btn btn--primary">Quiero probar Fiadito</a>
            <a href="#como-funciona" className="btn btn--ghost">Ver cómo funciona</a>
          </div>
        </div>

        <div className="hero__visual">
          <PhoneMockup />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;