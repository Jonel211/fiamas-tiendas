/**
 * FeaturesSection
 * Sección "Todo lo que tu bodega necesita, en un solo lugar".
 * Muestra una grilla tipo bento con 6 tarjetas de características.
 */

import { FEATURES } from '@/constants/landingData';
import SectionHead from '../shared/SectionHead';
import FeatureCard from './FeatureCard';
import './FeaturesSection.css';

const FeaturesSection = () => {
  return (
    <section className="section" id="caracteristicas">
      <div className="container">
        <SectionHead
          title="Todo lo que tu bodega necesita, en un solo lugar"
          lead="Fiadito no es solo una lista de deudas: es el orden que le faltaba a tu tienda."
        />

        <div className="features">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.id} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;