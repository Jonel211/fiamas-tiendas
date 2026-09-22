// src/components/ui/FormField.jsx
/**
 * FormField
 * Input reutilizable con label, icono opcional y mensaje de error.
 * Usa la paleta teal de Fiamas.
 */

const FormField = ({
  label,
  name,
  type = 'text',
  placeholder,
  icon: Icon,
  value,
  onChange,
  error,
}) => {
  return (
    <div className="space-y-1">
      <label className="block text-[12px] font-medium" style={{ color: '#454b5c' }}>
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
            style={{ color: '#a8afbd' }}
          />
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 text-[13px] rounded-lg border placeholder:text-[#b8bdc9] focus:outline-none transition-all"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            borderColor: error ? '#E63946' : 'rgba(255, 255, 255, 0.9)',
            color: '#2B2D42',
          }}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = error ? '#E63946' : '#1D9492')
          }
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = error
              ? '#E63946'
              : 'rgba(255,255,255,0.9)')
          }
        />
      </div>
      {error && (
        <p className="text-[11px] mt-1" style={{ color: '#E63946' }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;