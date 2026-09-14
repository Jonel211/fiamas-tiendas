/**
 * HowItWorksSection
 * Sección "Cómo funciona". Layout de 2 columnas:
 * - Izquierda: pasos numerados (StepperNav).
 * - Derecha: panel con mock visual del paso activo (StepperPanel).
 * Incluye autoplay cuando el stepper está visible en pantalla.
 */

import { STEPS } from '@/constants/landingData';
import { useStepper } from '@/hooks/useStepper';
import SectionHead from '../shared/SectionHead';
import StepperNav from './StepperNav';
import StepperPanel from './StepperPanel';
import './HowItWorksSection.css';

const HowItWorksSection = () => {
  const { current, goTo, containerRef } = useStepper(STEPS.length);

  return (
    <section className="section section--ruled" id="como-funciona">
      <div className="container">
        <SectionHead
          title="Cómo funciona"
          lead="De abrir la app a tener tu bodega al día, en cuatro pasos."
        />

        <div className="stepper" ref={containerRef}>
          <StepperNav steps={STEPS} current={current} onSelect={goTo} />
          <StepperPanel steps={STEPS} current={current} />
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;