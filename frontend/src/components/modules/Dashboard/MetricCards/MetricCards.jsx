/**
 * MetricCards
 * Grilla con las 2 tarjetas de métricas, apiladas verticalmente.
 */

import MetricCardItem from './MetricCardItem';
import bgTiendas from '@/assets/images/card-tiendas.png';
import bgTenderos from '@/assets/images/card-tenderos.png';

const METRICS = [
  {
    id: 1,
    value: 2,
    label: 'Tiendas',
    subtitle: 'Registradas en la plataforma',
    variant: 'gold',
    bgImage: bgTiendas,
  },
  {
    id: 2,
    value: 12,
    label: 'Tenderos',
    subtitle: 'Activos actualmente',
    variant: 'blue',
    bgImage: bgTenderos,
  },
];

const MetricCards = () => {
  return (
    <div className="flex flex-col gap-4 h-full">
      {METRICS.map((m) => (
        <MetricCardItem key={m.id} {...m} />
      ))}
    </div>
  );
};

export default MetricCards;