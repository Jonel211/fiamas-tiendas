import { useState, useEffect, useMemo } from 'react';
import { Loader2, AlertCircle, User } from 'lucide-react';
import { getTenderos, getCachedTenderos, createTendero, updateTendero, deleteTendero, toggleTenderoActivo } from '@/services/vendorService';
import { useToast } from '@/context/ToastContext';
import VendorsHeader from '@/components/modules/Vendors/VendorsHeader';
import VendorsFilters from '@/components/modules/Vendors/VendorsFilters';
import VendorsTable from '@/components/modules/Vendors/VendorsTable';
import VendorModal from '@/components/modules/Vendors/VendorModal';
import VendorDetailView from '@/components/modules/Vendors/VendorDetailView';
import ConfirmDeleteModal from '@/components/ui/ConfirmDeleteModal';

const VendorsPage = () => {
  const toast = useToast();
  const [vendors, setVendors] = useState(() => getCachedTenderos() || []);
  const [loading, setLoading] = useState(() => !getCachedTenderos());
  const [error, setError] = useState(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVendor, setCurrentVendor] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [modalError, setModalError] = useState('');

  // Detalle en página y Eliminación
  const [selectedVendorDetails, setSelectedVendorDetails] = useState(null);
  const [vendorToDelete, setVendorToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadVendors = async (force = false) => {
    if (!getCachedTenderos() || force) {
      if (!vendors.length) setLoading(true);
    }
    setError(null);
    try {
      const data = await getTenderos(force);
      setVendors(data);
    } catch (err) {
      setError(err.message || 'Error al cargar los tenderos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const openModal = (vendor = null) => {
    setModalError('');
    if (vendor) {
      setCurrentVendor({
        id: vendor.id,
        dni: vendor.dni || '',
        nombres: vendor.nombres || '',
        apellidos: vendor.apellidos || '',
        telefono: vendor.telefono || '',
        foto_perfil_url: vendor.foto_perfil_url || '',
        password: '',
        activo: Boolean(vendor.activo),
      });
    } else {
      setCurrentVendor({
        dni: '',
        nombres: '',
        apellidos: '',
        telefono: '',
        foto_perfil_url: '',
        password: '',
        activo: true,
        nombre_tienda: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentVendor(null);
    setModalError('');
  };

  const handleFieldChange = (field, value) => {
    setCurrentVendor((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setIsSubmitting(true);

    try {
      if (currentVendor.id) {
        const payload = {
          dni: currentVendor.dni,
          nombres: currentVendor.nombres,
          apellidos: currentVendor.apellidos,
          telefono: currentVendor.telefono,
          foto_perfil_url: currentVendor.foto_perfil_url,
          activo: currentVendor.activo,
        };
        if (currentVendor.password && currentVendor.password.trim() !== '') {
          payload.password = currentVendor.password;
        }

        const updated = await updateTendero(currentVendor.id, payload);
        setVendors((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
        if (selectedVendorDetails && selectedVendorDetails.id === updated.id) {
          setSelectedVendorDetails(updated);
        }
        toast.success('Tendero actualizado', `Los datos de "${updated.nombres || currentVendor.nombres}" se actualizaron con éxito.`);
      } else {
        const created = await createTendero(currentVendor);
        setVendors((prev) => [created, ...prev]);
        toast.success('Tendero registrado', `"${created.nombres} ${created.apellidos}" fue registrado correctamente.`);
      }
      closeModal();
    } catch (err) {
      setModalError(err.message || 'Error al guardar el tendero');
      toast.error('Error al guardar', err.message || 'No se pudo guardar la información del tendero');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (vendor) => {
    setActionLoadingId(vendor.id);
    try {
      await toggleTenderoActivo(vendor.id);
      const nuevoEstado = !vendor.activo;
      setVendors((prev) =>
        prev.map((v) => (v.id === vendor.id ? { ...v, activo: nuevoEstado } : v))
      );
      if (selectedVendorDetails && selectedVendorDetails.id === vendor.id) {
        setSelectedVendorDetails((prev) => ({ ...prev, activo: nuevoEstado }));
      }
      toast.info(
        nuevoEstado ? 'Tendero activado' : 'Tendero desactivado',
        `"${vendor.nombres}" está ahora ${nuevoEstado ? 'activo' : 'inactivo'}.`
      );
    } catch (err) {
      toast.error('Error', err.message || 'No se pudo cambiar el estado del tendero');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!vendorToDelete) return;
    setIsDeleting(true);
    try {
      await deleteTendero(vendorToDelete.id);
      setVendors((prev) => prev.filter((v) => v.id !== vendorToDelete.id));
      if (selectedVendorDetails && selectedVendorDetails.id === vendorToDelete.id) {
        setSelectedVendorDetails(null);
      }
      toast.success(
        'Tendero eliminado',
        `"${vendorToDelete.nombres} ${vendorToDelete.apellidos}" y sus tiendas asociadas han sido eliminados correctamente.`
      );
      setVendorToDelete(null);
    } catch (err) {
      toast.error('Error al eliminar', err.message || 'No se pudo eliminar el tendero');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      const search = searchTerm.toLowerCase();
      const nombres = (vendor.nombres || '').toLowerCase();
      const apellidos = (vendor.apellidos || '').toLowerCase();
      const dni = (vendor.dni || '').toLowerCase();
      const telefono = (vendor.telefono || '').toLowerCase();

      const matchSearch =
        nombres.includes(search) ||
        apellidos.includes(search) ||
        dni.includes(search) ||
        telefono.includes(search);

      const matchStatus =
        statusFilter === 'all' || (statusFilter === 'active' ? vendor.activo : !vendor.activo);

      return matchSearch && matchStatus;
    });
  }, [vendors, searchTerm, statusFilter]);

  return (
    <div className="space-y-4 animate-fade-soft">
      {/* Si hay un tendero seleccionado para ver detalle, se reemplaza la vista en la misma página */}
      {selectedVendorDetails ? (
        <VendorDetailView
          vendor={selectedVendorDetails}
          onBack={() => setSelectedVendorDetails(null)}
          onEdit={openModal}
          onDelete={setVendorToDelete}
          onToggleStatus={handleToggleStatus}
        />
      ) : (
        <>
          <VendorsHeader onRefresh={() => loadVendors(true)} loading={loading} />

          <VendorsFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            onClearFilters={handleClearFilters}
            onOpenModal={openModal}
          />

          {error && (
            <div className="flex items-center gap-3 p-4 mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
              <button onClick={loadVendors} className="ml-auto underline text-sm font-semibold">
                Reintentar
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white/85 dark:bg-[#1A1F2E]/80 rounded-md border border-white/50 dark:border-white/10 backdrop-blur-sm shadow-sm">
              <Loader2 className="w-8 h-8 animate-spin text-[#1D9492] mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Cargando lista de tenderos...</p>
            </div>
          ) : filteredVendors.length === 0 ? (
            <div className="text-center py-16 bg-white/85 dark:bg-[#1A1F2E]/80 rounded-md border border-white/50 dark:border-white/10 backdrop-blur-sm shadow-sm">
              <User className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3 opacity-60" />
              <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300">No se encontraron tenderos</h3>
              <p className="text-sm text-gray-400 mt-1">Prueba con otro término de búsqueda o agrega un nuevo tendero.</p>
            </div>
          ) : (
            <VendorsTable
              vendors={filteredVendors}
              onEdit={openModal}
              onView={setSelectedVendorDetails}
              onDelete={setVendorToDelete}
              onToggleStatus={handleToggleStatus}
              actionLoadingId={actionLoadingId}
            />
          )}
        </>
      )}

      {/* Modal para Crear/Editar Tendero */}
      <VendorModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        currentVendor={currentVendor}
        onChange={handleFieldChange}
        isSubmitting={isSubmitting}
        modalError={modalError}
      />

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmDeleteModal
        isOpen={Boolean(vendorToDelete)}
        onClose={() => setVendorToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar Tendero?"
        description={`¿Estás seguro de que deseas eliminar permanentemente a "${vendorToDelete?.nombres} ${vendorToDelete?.apellidos}"? Esta acción borrará también las tiendas y datos asociados a este tendero.`}
        confirmText="Eliminar Tendero"
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default VendorsPage;