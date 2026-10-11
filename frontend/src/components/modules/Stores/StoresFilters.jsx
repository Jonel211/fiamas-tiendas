// src/components/modules/Stores/StoresFilters.jsx
import Input from '../../ui/Input';
import Select from '../../ui/Select';

const StoresFilters = () => {
  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
    { value: 'pendiente', label: 'Pendiente' },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <Input placeholder="Buscar tienda por nombre, RUC o ID..." />
      </div>
      <div className="w-full sm:w-48">
        <Select options={statusOptions} />
      </div>
      <div className="w-full sm:w-48">
        <Select options={statusOptions} /> {/* Podría ser filtro por fecha o región */}
      </div>
    </div>
  );
};
export default StoresFilters;