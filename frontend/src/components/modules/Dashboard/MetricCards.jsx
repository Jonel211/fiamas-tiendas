// src/components/modules/Dashboard/MetricCards.jsx
import { metricData } from '../../../constants';
import MetricCardItem from './MetricCardItem';

const MetricCards = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricData.map((metric) => (
        <MetricCardItem key={metric.id} {...metric} />
      ))}
    </div>
  );
};

export default MetricCards;