/**
 * FeatureCard
 * Tarjeta individual de la sección "Todo lo que tu bodega necesita".
 * Variantes:
 * - "default": tarjeta normal (2 columnas)
 * - "lg": tarjeta más grande (3 columnas)
 * - "wide": tarjeta ancha al fondo (6 columnas, fondo navy)
 */

import FeatureIcon from './FeatureIcon';
import './FeatureCard.css';

const FeatureCard = ({ num, title, description, accent, size, icon }) => {
  const sizeClass =
    size === 'lg' ? 'feature-card--lg' :
    size === 'wide' ? 'feature-card--wide' :
    '';

  const isWide = size === 'wide';

  return (
    <article
      className={`feature-card ${sizeClass}`}
      data-reveal
      style={{ '--accent': accent }}
    >
      {isWide ? (
        <>
          <span className="feature-card__icon">
            <FeatureIcon name={icon} />
          </span>
          <div className="feature-card__text">
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
          <span className="feature-card__num">{num}</span>
        </>
      ) : (
        <>
          <div className="feature-card__top">
            <span className="feature-card__icon">
              <FeatureIcon name={icon} />
            </span>
            <span className="feature-card__num">{num}</span>
          </div>
          <h3>{title}</h3>
          <p>{description}</p>
        </>
      )}
    </article>
  );
};

export default FeatureCard;