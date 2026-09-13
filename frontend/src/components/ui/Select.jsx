// src/components/ui/Select.jsx
const Select = ({ options, className = '', ...props }) => {
  return (
    <select
      className={`w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 ${className}`}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};
export default Select;