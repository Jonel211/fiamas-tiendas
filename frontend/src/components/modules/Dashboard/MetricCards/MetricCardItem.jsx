/**
 * MetricCardItem
 * Tarjeta de métrica con imagen decorativa de fondo.
 * - Light: gradiente de color saturado a claro (izq → der).
 * - Dark: gradiente + glow exterior sutil del color de acento.
 * Tamaños responsive: más compacto en móvil.
 */

const VARIANTS = {
  gold: {
    light: 'bg-gradient-to-r from-[#F2C94C] to-[#FBE8A6] text-gray-800',
    dark: 'dark:bg-gradient-to-r dark:from-[#8F6E1E] dark:to-[#2A2410] dark:text-slate-100',
    glowColor: 'rgba(242, 201, 76, 0.42)',
  },
  blue: {
    light: 'bg-gradient-to-r from-[#B1D8F7] to-[#DEEBF9] text-gray-800',
    dark: 'dark:bg-gradient-to-r dark:from-[#2E7D8F] dark:to-[#0F2A38] dark:text-slate-100',
    glowColor: 'rgba(46, 196, 182, 0.4)',
  },
};

const MetricCardItem = ({ value, label, subtitle, variant, bgImage }) => {
  const v = VARIANTS[variant] || VARIANTS.blue;

  return (
    <div className="relative flex-1 min-h-[140px] sm:min-h-[170px]">
      <div
        className="absolute inset-0 rounded-md pointer-events-none hidden dark:block"
        style={{
          boxShadow: `0 0 9px 0 ${v.glowColor}`,
        }}
      />

      <div
        className={`relative h-full rounded-md overflow-hidden ${v.light} ${v.dark}`}
      >
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
            }}
          />
        )}

        <div className="relative z-10 flex flex-col justify-between h-full p-4 sm:p-6 lg:p-7">
          <div>
            <span className="text-[44px] sm:text-[56px] lg:text-[64px] font-bold leading-none tracking-tight">
              {value}
            </span>
            <span className="inline-block ml-2 sm:ml-3 text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest align-top mt-1.5 sm:mt-2 opacity-70">
              Total
            </span>
          </div>

          <div>
            <div className="w-8 sm:w-10 h-[2px] mb-2 sm:mb-3 rounded-full bg-gray-800/40 dark:bg-slate-100/40" />
            <p className="text-[13px] sm:text-[15px] font-bold leading-tight">{label}</p>
            {subtitle && (
              <p className="text-[11px] sm:text-[12px] mt-0.5 font-medium opacity-75">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricCardItem;