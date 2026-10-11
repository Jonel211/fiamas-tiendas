// src/components/ui/Card.jsx
const Card = ({ children, className = '', hover = false }) => {
  return (
    <div
      className={`bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 ${
        hover ? 'hover:shadow-xl hover:-translate-y-1 transition-all duration-300' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;