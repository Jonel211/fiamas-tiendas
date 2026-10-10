// src/components/modules/Vendors/VendorsFilters.jsx
import Input from '../../ui/Input';
import Select from '../../ui/Select';

const VendorsFilters = () => {
  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <Input placeholder="Buscar tendero por nombre, DNI o teléfono..." />
      </div>
      <div className="w-full sm:w-48">
        <Select options={statusOptions} />
      </div>
    </div>
  );
};
export default VendorsFilters;