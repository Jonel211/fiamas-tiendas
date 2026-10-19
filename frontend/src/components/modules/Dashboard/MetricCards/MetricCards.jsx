/**
 * MetricCards
 * Grilla con las 2 tarjetas de métricas, apiladas verticalmente.
 */

import MetricCardItem from './MetricCardItem';
import bgTiendas from '@/assets/images/card-tiendas.png';
import bgTenderos from '@/assets/images/card-tenderos.png';

const MetricCards = ({ resumen, loading }) => {
  const metrics = [
    {
      id: 1,
      value: loading ? '—' : (resumen?.totalTiendas ?? 0),
      label: 'Tiendas',
      subtitle: resumen ? `${resumen.tiendasActivas ?? 0} activas actualmente` : 'Registradas en la plataforma',
      variant: 'gold',
      bgImage: bgTiendas,
    },
    {
      id: 2,
      value: loading ? '—' : (resumen?.totalTenderos ?? 0),
      label: 'Tenderos',
      subtitle: resumen ? `${resumen.tenderosActivos ?? 0} activos actualmente` : 'Activos en la plataforma',
      variant: 'blue',
      bgImage: bgTenderos,
    },
  ];

  return (
    <div className="flex flex-col gap-4 h-full">
      {metrics.map((m) => (
        <MetricCardItem key={m.id} {...m} />
      ))}
    </div>
  );
};

export default MetricCards;