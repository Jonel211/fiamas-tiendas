/**
 * StepperNav
 * Columna izquierda del stepper "Cómo funciona".
 * Muestra los 4 pasos numerados, la barra de progreso vertical,
 * y resalta el paso activo.
 */

import './StepperNav.css';

const StepperNav = ({ steps, current, onSelect }) => {
  return (
    <div className="stepper__nav" role="tablist" aria-label="Pasos para usar Fiadito">
      <span className="stepper__track" aria-hidden="true">
        <span
          className="stepper__track-fill"
          style={{ height: `${(current / (steps.length - 1)) * 100}%` }}
        />
      </span>

      {steps.map((step, i) => {
        const isActive = i === current;
        return (
          <button
            key={step.id}
            className={`stepper__step ${isActive ? 'is-active' : ''}`}
            role="tab"
            aria-selected={isActive}
            aria-controls={`paso-${step.id}`}
            id={`tab-${step.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onSelect(i)}
          >
            <span className="stepper__num">{i + 1}</span>
            <span className="stepper__label">
              <strong>{step.title}</strong>
              <small>{step.description}</small>
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default StepperNav;