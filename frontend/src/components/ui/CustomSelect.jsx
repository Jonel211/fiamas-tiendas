/**
 * CustomSelect
 * Dropdown personalizado que funciona perfecto en light y dark mode.
 * Reemplaza al <select> nativo cuando necesitamos controlar los colores.
 */

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const CustomSelect = ({ options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      {/* Botón */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-between gap-2 min-w-[180px] px-4 py-1.5 text-[12.5px] font-medium rounded-lg bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
      >
        <span>{value}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 min-w-full w-max bg-white dark:bg-[#1A1F2E] rounded-lg shadow-lg dark:shadow-xl border border-gray-200 dark:border-white/10 overflow-hidden z-50">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleSelect(option)}
              className={`w-full text-left px-4 py-2 text-[12.5px] transition-colors ${
                value === option
                  ? 'bg-[#1D9492]/10 dark:bg-[#2EBFBB]/15 text-[#1D9492] dark:text-[#2EBFBB] font-semibold'
                  : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;