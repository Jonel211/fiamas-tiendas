// src/components/modules/Stores/StoresHeader.jsx
import Button from '../../ui/Button';
import { Plus } from 'lucide-react';

const StoresHeader = () => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Tiendas</h1>
        <p className="text-sm text-gray-500">Administra las tiendas afiliadas a Fiamas.</p>
      </div>
      <Button variant="primary" size="md" className="flex items-center gap-2">
        <Plus className="w-4 h-4" />
        Agregar Tienda
      </Button>
    </div>
  );
};
export default StoresHeader;