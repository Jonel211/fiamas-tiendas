/**
 * StepperPanel
 * Columna derecha del stepper "Cómo funciona".
 * Muestra el panel con el mock visual y el texto correspondiente
 * al paso activo. Cada paso tiene un mock distinto.
 */

import './StepperPanel.css';

/** Mocks visuales específicos por paso */
const PanelMock1 = () => (
  <div className="mock" aria-hidden="true">
    <span className="mock__bar" style={{ width: '72%' }} />
    <span className="mock__bar" style={{ width: '46%' }} />
    <span className="mock__btn">Crear tienda</span>
  </div>
);

const PanelMock2 = () => (
  <div className="mock" aria-hidden="true">
    <div className="mock__row"><span>Arroz 1 kg</span><span className="mock__price">S/ 4.50</span></div>
    <div className="mock__row"><span>Aceite 1 L</span><span className="mock__price">S/ 9.80</span></div>
    <div className="mock__row"><span>Leche 400 g</span><span className="mock__price">S/ 4.20</span></div>
  </div>
);

const PanelMock3 = () => (
  <div className="mock" aria-hidden="true">
    <div className="mock__row">
      <span className="mock__avatar" style={{ background: '#1F8A4C' }}>MT</span>
      <span className="mock__col">
        <strong>María Torres</strong>
        <small>2 productos · hoy</small>
      </span>
      <span className="mock__price">S/ 8.50</span>
    </div>
    <div className="mock__row">
      <span>Total anotado</span>
      <span className="mock__price">S/ 8.50</span>
    </div>
  </div>
);

const PanelMock4 = () => (
  <div className="mock" aria-hidden="true">
    <div className="mock__row">
      <span>Total por cobrar</span>
      <span className="mock__price">S/ 57.50</span>
    </div>
    <div className="mock__row">
      <span>María Torres</span>
      <span className="tag tag--paid">Pagado</span>
    </div>
  </div>
);

const MOCKS = [PanelMock1, PanelMock2, PanelMock3, PanelMock4];

const StepperPanel = ({ steps, current }) => {
  return (
    <div className="stepper__panels">
      {steps.map((step, i) => {
        const Mock = MOCKS[i];
        const isActive = i === current;
        return (
          <div
            key={step.id}
            className={`stepper__panel ${isActive ? 'is-active' : ''}`}
            id={`paso-${step.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${step.id}`}
            tabIndex={0}
          >
            <Mock />
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        );
      })}
    </div>
  );
};

export default StepperPanel;