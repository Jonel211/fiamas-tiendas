/**
 * MetricCardItem
 * Tarjeta de métrica con imagen decorativa de fondo.
 * Contenido izquierdo: número grande + label + subtítulo + línea decorativa.
 */

const MetricCardItem = ({ value, label, subtitle, variant, bgImage }) => {
  const variants = {
    gold: {
      bg: '#F2C94C',
      text: '#2B2D42',
      line: 'rgba(43, 45, 66, 0.4)',
    },
    blue: {
      bg: '#1E88E5',
      text: '#FFFFFF',
      line: 'rgba(255, 255, 255, 0.5)',
    },
    green: {
      bg: '#1F8A4C',
      text: '#FFFFFF',
      line: 'rgba(255, 255, 255, 0.5)',
    },
    navy: {
      bg: '#2B2D42',
      text: '#FFFFFF',
      line: 'rgba(255, 255, 255, 0.5)',
    },
  };

  const v = variants[variant] || variants.green;

  return (
    <div
      className="relative rounded-md overflow-hidden flex-1 min-h-[170px] shadow-sm"
      style={{ backgroundColor: v.bg, color: v.text }}
    >
      {/* Imagen decorativa de fondo */}
      {bgImage && (
        <img
          src={bgImage}
          alt=""
          aria-hidden="true"
          className="absolute pointer-events-none select-none"
          style={{
            right: '-20px',
            top: '50%',
            transform: 'translateY(-50%)',
            height: '115%',
            width: 'auto',
            objectFit: 'contain',
            opacity: 0.35,
            mixBlendMode: 'overlay',
          }}
        />
      )}

      {/* Contenido */}
      <div className="relative z-10 flex flex-col justify-between h-full p-7">
        <div>
          <span className="text-[64px] font-bold leading-none tracking-tight">
            {value}
          </span>
          <span
            className="inline-block ml-3 text-[11px] font-semibold uppercase tracking-widest align-top mt-2"
            style={{ opacity: 0.7 }}
          >
            Total
          </span>
        </div>

        <div>
          <div
            className="w-10 h-[2px] mb-3 rounded-full"
            style={{ backgroundColor: v.line }}
          />
          <p className="text-[15px] font-bold leading-tight">{label}</p>
          {subtitle && (
            <p
              className="text-[12px] mt-0.5 font-medium"
              style={{ opacity: 0.75 }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetricCardItem;