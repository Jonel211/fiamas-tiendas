/**
 * PhoneMockup
 * Mockup de celular que muestra la pantalla "Mis fiados" de la app Fiadito.
 * Se muestra dentro del HeroSection a la derecha.
 */

import { PHONE_ITEMS } from '@/constants/landingData';
import './PhoneMockup.css';

const PhoneMockup = () => {
  return (
    <div className="phone" role="img" aria-label="Vista previa de la app Fiadito mostrando una lista de fiados">
      <div className="phone__notch" />
      <div className="phone__screen">
        <div className="phone__topbar">
          <span className="phone__store">Bodega Don Elías</span>
          <span className="phone__dot" />
        </div>

        <div className="phone__header">
          <h3>Mis fiados</h3>
          <span className="phone__total">S/ 57.50 por cobrar</span>
        </div>

        <ul className="phone__list">
          {PHONE_ITEMS.map((item) => (
            <li className="phone__item" key={item.initials}>
              <span className="phone__avatar" style={{ background: item.color }}>
                {item.initials}
              </span>
              <span className="phone__info">
                <strong>{item.name}</strong>
                <small>{item.time}</small>
              </span>
              <span className="phone__amount">
                {item.amount}
                <span className={`tag tag--${item.status}`}>
                  {item.status === 'paid' ? 'Pagado' : 'Pendiente'}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <button className="phone__fab" aria-hidden="true">+</button>
      </div>
    </div>
  );
};

export default PhoneMockup;