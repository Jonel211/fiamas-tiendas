import { useState, useEffect, useMemo } from 'react';
import { Loader2, AlertCircle, Store } from 'lucide-react';
import { getTiendas, getCachedTiendas, createTienda, updateTienda, deleteTienda, toggleTiendaActivo, toggleTiendaQR, generarTiendaQR } from '@/services/storeService';
import { getTenderos, getCachedTenderos } from '@/services/vendorService';
import { useToast } from '@/context/ToastContext';
import StoresHeader from '@/components/modules/Stores/StoresHeader';
import StoresFilters from '@/components/modules/Stores/StoresFilters';
import StoreCard from '@/components/modules/Stores/StoreCard';
import StoreModal from '@/components/modules/Stores/StoreModal';
import StoreDetailView from '@/components/modules/Stores/StoreDetailView';
import ConfirmDeleteModal from '@/components/ui/ConfirmDeleteModal';

const StoresPage = () => {
  const toast = useToast();
  const [stores, setStores] = useState(() => getCachedTiendas() || []);
  const [vendors, setVendors] = useState(() => getCachedTenderos() || []);
  const [loading, setLoading] = useState(() => !getCachedTiendas());
  const [error, setError] = useState(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [qrFilter, setQrFilter] = useState('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStore, setCurrentStore] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [modalError, setModalError] = useState('');

  // Detalle en página y Eliminación
  const [selectedStoreDetails, setSelectedStoreDetails] = useState(null);
  const [storeToDelete, setStoreToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async (force = false) => {
    if (!getCachedTiendas() || force) {
      if (!stores.length) setLoading(true);
    }
    setError(null);
    try {
      const [storesData, vendorsData] = await Promise.all([
        getTiendas(force),
        getTenderos(force).catch(() => [])
      ]);
      setStores(storesData);
      setVendors(vendorsData);
    } catch (err) {
      setError(err.message || 'Error al cargar las tiendas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = (store = null) => {
    setModalError('');
    if (store) {
      setCurrentStore({
        id: store.id,
        nombre: store.nombre || '',
        direccion: store.direccion || '',
        ruc: store.ruc || '',
        telefono: store.telefono || '',
        imagen_url: store.imagen_url || '',
        tendero_id: store.tendero_id || '',
        activo: Boolean(store.activo),
        qr_activo: Boolean(store.qr_activo),
      });
    } else {
      setCurrentStore({
        nombre: '',
        direccion: '',
        ruc: '',
        telefono: '',
        imagen_url: '',
        tendero_id: vendors.length > 0 ? vendors[0].id : '',
        activo: true,
        qr_activo: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentStore(null);
    setModalError('');
  };

  const handleFieldChange = (field, value) => {
    setCurrentStore((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setIsSubmitting(true);

    try {
      if (currentStore.id) {
        const updated = await updateTienda(currentStore.id, currentStore);
        setStores((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        if (selectedStoreDetails && selectedStoreDetails.id === updated.id) {
          setSelectedStoreDetails(updated);
        }
        toast.success('Tienda actualizada', `Los datos de "${updated.nombre || currentStore.nombre}" se guardaron exitosamente.`);
      } else {
        const created = await createTienda(currentStore);
        setStores((prev) => [created, ...prev]);
        toast.success('Tienda creada', `La tienda "${created.nombre || currentStore.nombre}" se registró con éxito.`);
      }
      closeModal();
    } catch (err) {
      setModalError(err.message || 'Error al guardar los datos de la tienda');
      toast.error('Error al guardar', err.message || 'No se pudo guardar la información de la tienda');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActivo = async (store) => {
    setActionLoadingId(`activo-${store.id}`);
    try {
      await toggleTiendaActivo(store.id);
      const nuevoEstado = !store.activo;
      setStores((prev) =>
        prev.map((s) => (s.id === store.id ? { ...s, activo: nuevoEstado } : s))
      );
      if (selectedStoreDetails && selectedStoreDetails.id === store.id) {
        setSelectedStoreDetails((prev) => ({ ...prev, activo: nuevoEstado }));
      }
      toast.info(
        nuevoEstado ? 'Tienda activada' : 'Tienda desactivada',
        `"${store.nombre}" está ahora ${nuevoEstado ? 'activa' : 'inactiva'}.`
      );
    } catch (err) {
      toast.error('Error', err.message || 'No se pudo cambiar el estado de la tienda');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleQR = async (store) => {
    setActionLoadingId(`qr-${store.id}`);
    try {
      const nuevoEstado = !store.qr_activo;
      await toggleTiendaQR(store.id, nuevoEstado);
      setStores((prev) =>
        prev.map((s) => (s.id === store.id ? { ...s, qr_activo: nuevoEstado } : s))
      );
      if (selectedStoreDetails && selectedStoreDetails.id === store.id) {
        setSelectedStoreDetails((prev) => ({ ...prev, qr_activo: nuevoEstado }));
      }
      toast.info(
        nuevoEstado ? 'QR Activado' : 'QR Desactivado',
        `El token QR de "${store.nombre}" está ${nuevoEstado ? 'activo' : 'desactivado'}.`
      );
    } catch (err) {
      toast.error('Error QR', err.message || 'No se pudo cambiar el estado del QR');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRegenerarQR = async (store) => {
    if (!window.confirm(`¿Deseas regenerar el código QR para "${store.nombre}"?`)) return;
    setActionLoadingId(`regen-${store.id}`);
    try {
      const res = await generarTiendaQR(store.id);
      setStores((prev) =>
        prev.map((s) => (s.id === store.id ? { ...s, qr_token: res.qr_token, qr_activo: true } : s))
      );
      if (selectedStoreDetails && selectedStoreDetails.id === store.id) {
        setSelectedStoreDetails((prev) => ({ ...prev, qr_token: res.qr_token, qr_activo: true }));
      }
      toast.success('QR Regenerado', `Nuevo código QR asignado a "${store.nombre}".`);
    } catch (err) {
      toast.error('Error', err.message || 'No se pudo regenerar el QR');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!storeToDelete) return;
    setIsDeleting(true);
    try {
      await deleteTienda(storeToDelete.id);
      setStores((prev) => prev.filter((s) => s.id !== storeToDelete.id));
      if (selectedStoreDetails && selectedStoreDetails.id === storeToDelete.id) {
        setSelectedStoreDetails(null);
      }
      toast.success('Tienda eliminada', `La tienda "${storeToDelete.nombre}" ha sido eliminada correctamente.`);
      setStoreToDelete(null);
    } catch (err) {
      toast.error('Error al eliminar', err.message || 'No se pudo eliminar la tienda');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setQrFilter('all');
  };

  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      const search = searchTerm.toLowerCase();
      const nombre = (store.nombre || '').toLowerCase();
      const ruc = (store.ruc || '').toLowerCase();
      const responsable = store.tendero
        ? `${store.tendero.nombres} ${store.tendero.apellidos}`.toLowerCase()
        : '';

      const matchSearch = nombre.includes(search) || ruc.includes(search) || responsable.includes(search);
      const matchStatus = statusFilter === 'all' || (statusFilter === 'active' ? store.activo : !store.activo);
      const matchQr = qrFilter === 'all' || (qrFilter === 'qr_active' ? store.qr_activo : !store.qr_activo);

      return matchSearch && matchStatus && matchQr;
    });
  }, [stores, searchTerm, statusFilter, qrFilter]);

  return (
    <div className="space-y-4 animate-fade-soft">
      {/* Si hay una tienda seleccionada para ver detalle, se reemplaza la vista en la misma página */}
      {selectedStoreDetails ? (
        <StoreDetailView
          store={selectedStoreDetails}
          onBack={() => setSelectedStoreDetails(null)}
          onEdit={openModal}
          onDelete={setStoreToDelete}
          onToggleActivo={handleToggleActivo}
          onToggleQR={handleToggleQR}
          onRegenerarQR={handleRegenerarQR}
        />
      ) : (
        <>
          <StoresHeader onRefresh={() => loadData(true)} loading={loading} />

          <StoresFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            qrFilter={qrFilter}
            onQrChange={setQrFilter}
            onClearFilters={handleClearFilters}
            onOpenModal={openModal}
          />

          {error && (
            <div className="flex items-center gap-3 p-4 mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
              <button onClick={loadData} className="ml-auto underline text-sm font-semibold">
                Reintentar
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white/85 dark:bg-[#1A1F2E]/80 rounded-md border border-white/50 dark:border-white/10 backdrop-blur-sm shadow-sm">
              <Loader2 className="w-8 h-8 animate-spin text-[#1D9492] mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Cargando tiendas conectadas...</p>
            </div>
          ) : filteredStores.length === 0 ? (
            <div className="text-center py-16 bg-white/85 dark:bg-[#1A1F2E]/80 rounded-md border border-white/50 dark:border-white/10 backdrop-blur-sm shadow-sm">
              <Store className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3 opacity-60" />
              <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300">No se encontraron tiendas</h3>
              <p className="text-sm text-gray-400 mt-1">Intenta con otros filtros o añade una nueva tienda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStores.map((store) => (
                <StoreCard
                  key={store.id}
                  store={store}
                  onToggleActivo={handleToggleActivo}
                  onToggleQR={handleToggleQR}
                  onRegenerarQR={handleRegenerarQR}
                  onEdit={openModal}
                  onDelete={setStoreToDelete}
                  onViewDetails={setSelectedStoreDetails}
                  actionLoadingId={actionLoadingId}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal para Crear/Editar Tienda */}
      <StoreModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        currentStore={currentStore}
        onChange={handleFieldChange}
        vendors={vendors}
        isSubmitting={isSubmitting}
        modalError={modalError}
      />

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmDeleteModal
        isOpen={Boolean(storeToDelete)}
        onClose={() => setStoreToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar Tienda?"
        description={`¿Estás seguro de que deseas eliminar permanentemente la tienda "${storeToDelete?.nombre}"? Esta acción borrará también sus productos, categorías y registros asociados.`}
        confirmText="Eliminar Tienda"
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default StoresPage;