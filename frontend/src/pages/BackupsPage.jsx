// src/pages/BackupsPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  CheckCircle, HardDrive, AlertCircle, RefreshCw, Search,
  Download, XCircle, Loader, Clock, Trash2, RotateCcw, X,
  ShieldAlert, AlertTriangle, Upload
} from 'lucide-react';
import {
  getBackups, getBackupStats, generarBackup, downloadBackup,
  deleteBackup, restoreBackup, importBackup
} from '../services/backupService';
import { useToast } from '../context/ToastContext';
import iconBackups from '@/assets/icons/sidebar/backups.png';

// Configuración de estados visuales
const statusConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-600 dark:text-green-400',
    label: 'Exitoso',
  },
  failed: {
    icon: XCircle,
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    textColor: 'text-red-600 dark:text-red-400',
    label: 'Fallido',
  },
  in_progress: {
    icon: Loader,
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    textColor: 'text-yellow-600 dark:text-yellow-400',
    label: 'En progreso',
  },
};

// Tarjeta de estadística transparente con estilo Dashboard
const StatCard = ({ title, value, icon: Icon, color, bgColor, loading }) => (
  <div className="relative bg-white/85 dark:bg-[#1A1F2E]/80 rounded-md shadow-sm border border-white/50 dark:border-white/10 p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group overflow-hidden backdrop-blur-sm">
    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#1D9492] to-purple-500" />
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        {loading ? (
          <div className="h-7 w-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mt-1" />
        ) : (
          <p className="text-xl font-bold text-gray-800 dark:text-white mt-1">{value}</p>
        )}
      </div>
      <div className={`p-2.5 rounded-lg ${bgColor} group-hover:scale-110 transition-transform`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
  </div>
);

// Item del historial de copias
const TimelineItem = ({
  backup,
  isLast,
  onDownload,
  downloading,
  onOpenRestore,
  onOpenDelete
}) => {
  const cfg = statusConfig[backup.status] || statusConfig.success;
  const Icon = cfg.icon;
  const isThisDownloading = downloading === backup.filename;

  return (
    <div className="relative pl-8 pb-6 last:pb-0 group">
      {!isLast && (
        <div className="absolute left-[11px] top-5 bottom-0 w-0.5 bg-gray-200 dark:bg-slate-700/60" />
      )}
      <div className="absolute left-0 top-1 flex items-center justify-center">
        <div className={`w-6 h-6 rounded-full border-4 border-white/90 dark:border-[#1A1F2E] shadow-sm flex items-center justify-center ${cfg.bgColor}`}>
          <Icon className={`w-3 h-3 ${cfg.textColor}`} />
        </div>
      </div>
      <div className="bg-white/90 dark:bg-[#141923]/80 rounded-md shadow-sm border border-white/60 dark:border-white/10 p-4 ml-4 hover:shadow-md hover:border-[#1D9492]/40 transition-all duration-200 backdrop-blur-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-800 dark:text-white">{backup.dateLabel || backup.date}</span>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {backup.time}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bgColor} ${cfg.textColor}`}>
              {cfg.label}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100/70 dark:bg-white/5 px-2 py-0.5 rounded border border-gray-200/50 dark:border-white/5 truncate max-w-xs sm:max-w-md">
              {backup.filename}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-sm text-gray-500 dark:text-gray-400 self-end sm:self-auto">
            <span className="font-semibold text-gray-700 dark:text-gray-200">{backup.size}</span>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300">{backup.type}</span>

            <div className="flex items-center gap-1 pl-2 border-l border-gray-200 dark:border-white/10">
              {/* Botón Descargar */}
              <button
                type="button"
                title="Descargar archivo JSON de respaldo"
                onClick={() => onDownload(backup.filename)}
                disabled={isThisDownloading}
                className="p-1.5 text-gray-400 hover:text-[#1D9492] hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-md transition-colors disabled:opacity-50"
              >
                {isThisDownloading ? (
                  <Loader className="w-4 h-4 animate-spin text-[#1D9492]" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
              </button>

              {/* Botón Restaurar */}
              <button
                type="button"
                title="Restaurar base de datos a partir de este backup"
                onClick={() => onOpenRestore(backup)}
                className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-md transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Botón Eliminar con confirmación segura */}
              <button
                type="button"
                title="Eliminar este archivo de respaldo"
                onClick={() => onOpenDelete(backup)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        {backup.description && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{backup.description}</p>
        )}
      </div>
    </div>
  );
};

// Modal seguro de confirmación para eliminar backup (requiere escribir el nombre exacto)
const ConfirmDeleteBackupModal = ({ backup, onClose, onConfirm, deleting }) => {
  const [confirmName, setConfirmName] = useState('');

  if (!backup) return null;

  const isMatched = confirmName.trim() === backup.filename;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isMatched || deleting) return;
    onConfirm(backup.filename);
  };

  return createPortal(
    <div
      onClick={(e) => { if (e.target === e.currentTarget && !deleting) onClose(); }}
      className="fixed inset-0 z-[9999] w-screen h-screen flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      style={{ top: 0, left: 0, right: 0, bottom: 0, margin: 0 }}
    >
      <div
        className="bg-white dark:bg-[#1A1F2E] rounded-xl shadow-2xl p-6 w-full max-w-lg border border-gray-100 dark:border-white/10 text-left animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Eliminar Copia de Seguridad
            </h3>
            <p className="text-xs text-red-600 dark:text-red-400 font-medium">
              Esta acción es permanente e irreversible
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Para garantizar la máxima seguridad del sistema y prevenir eliminaciones accidentales, debes confirmar el nombre exacto del archivo antes de proceder.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-red-50/70 dark:bg-red-950/20 border border-red-200/70 dark:border-red-900/40 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nombre del archivo a eliminar:</p>
            <p className="font-mono text-xs font-bold text-red-700 dark:text-red-300 break-all select-all">
              {backup.filename}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Escribe <span className="font-mono text-red-600 dark:text-red-400">{backup.filename}</span> para confirmar:
            </label>
            <input
              type="text"
              autoFocus
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder="Pega o escribe el nombre completo del backup..."
              disabled={deleting}
              className="w-full px-3 py-2 text-xs font-mono border rounded-lg bg-white dark:bg-[#0F1420] text-gray-900 dark:text-white border-gray-300 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all disabled:opacity-50"
            />
            {confirmName && !isMatched && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> El texto no coincide exactamente todavía.
              </p>
            )}
            {isMatched && (
              <p className="text-[11px] text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Nombre verificado correctamente.
              </p>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-gray-100 dark:border-white/5">
            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!isMatched || deleting}
              className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors shadow-sm text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {deleting ? (
                <><Loader className="w-4 h-4 animate-spin" /> Eliminando backup...</>
              ) : (
                <><Trash2 className="w-4 h-4" /> Eliminar definitivamente</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

// Modal de confirmación para restaurar backup
const ConfirmRestoreBackupModal = ({ backup, onClose, onConfirm, restoring }) => {
  if (!backup) return null;

  return createPortal(
    <div
      onClick={(e) => { if (e.target === e.currentTarget && !restoring) onClose(); }}
      className="fixed inset-0 z-[9999] w-screen h-screen flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      style={{ top: 0, left: 0, right: 0, bottom: 0, margin: 0 }}
    >
      <div
        className="bg-white dark:bg-[#1A1F2E] rounded-xl shadow-2xl p-6 w-full max-w-lg border border-gray-100 dark:border-white/10 text-left animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              ¿Restaurar copia de seguridad?
            </h3>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              Sincronización de base de datos
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Esta operación leerá el archivo seleccionado y actualizará o restablecerá los registros de
          <strong className="text-gray-900 dark:text-white"> Tiendas, Tenderos, Productos, Categorías y Clientes</strong> con la información guardada en esta copia.
        </p>

        <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 rounded-lg p-3.5 mb-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">Archivo:</span>
            <span className="font-mono font-semibold text-gray-800 dark:text-white truncate max-w-[280px]">{backup.filename}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">Fecha del respaldo:</span>
            <span className="font-semibold text-gray-800 dark:text-white">{backup.dateLabel} ({backup.time})</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">Tamaño del archivo:</span>
            <span className="font-semibold text-[#1D9492]">{backup.size}</span>
          </div>
        </div>

        <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 mb-5 bg-gray-50 dark:bg-[#0F1420] p-3 rounded-lg border border-gray-100 dark:border-white/5">
          <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p>
            Se ejecutará en una transacción segura de base de datos. Si ocurre algún error, los cambios se revertirán automáticamente.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-white/5">
          <button
            type="button"
            onClick={onClose}
            disabled={restoring}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(backup.filename)}
            disabled={restoring}
            className="flex items-center gap-2 px-5 py-2 bg-[#1D9492] hover:bg-[#167876] text-white rounded-lg font-semibold transition-colors shadow-sm text-sm disabled:opacity-60"
          >
            {restoring ? (
              <><Loader className="w-4 h-4 animate-spin" /> Restaurando datos...</>
            ) : (
              <><RotateCcw className="w-4 h-4" /> Confirmar Restauración</>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// Modal para importar un archivo de copia de seguridad externo (.json)
const ImportBackupModal = ({ onClose, onImport, importing }) => {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [parseError, setParseError] = useState('');
  const [restaurarAhora, setRestaurarAhora] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (selectedFile) => {
    setParseError('');
    setParsedData(null);
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.json')) {
      setParseError('Solo se permiten archivos de respaldo con extensión .json');
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (!json || typeof json !== 'object') {
          setParseError('El archivo no contiene un objeto JSON válido.');
          setParsedData(null);
          return;
        }
        setParsedData(json);
      } catch (err) {
        setParseError('El archivo no contiene un JSON válido: ' + err.message);
        setParsedData(null);
      }
    };
    reader.onerror = () => {
      setParseError('Error al leer el archivo desde el dispositivo.');
    };
    reader.readAsText(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file || !parsedData || importing) return;
    onImport({
      filename: file.name,
      content: parsedData,
      restaurarAhora
    });
  };

  const conteos = parsedData?.metadata?.conteos || {
    tiendas: parsedData?.data?.tiendas?.length ?? parsedData?.tiendas?.length ?? 0,
    tenderos: parsedData?.data?.tenderos?.length ?? parsedData?.tenderos?.length ?? 0,
    productos: parsedData?.data?.productos?.length ?? parsedData?.productos?.length ?? 0,
    clientes: parsedData?.data?.clientes?.length ?? parsedData?.clientes?.length ?? 0,
  };

  return createPortal(
    <div
      onClick={(e) => { if (e.target === e.currentTarget && !importing) onClose(); }}
      className="fixed inset-0 z-[9999] w-screen h-screen flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      style={{ top: 0, left: 0, right: 0, bottom: 0, margin: 0 }}
    >
      <div
        className="bg-white dark:bg-[#1A1F2E] rounded-xl shadow-2xl p-6 w-full max-w-lg border border-gray-100 dark:border-white/10 text-left animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-[#1D9492] flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Importar Copia de Seguridad</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Sube un archivo .json generado previamente</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={importing}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label
            htmlFor="backup-file-input"
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              dragActive
                ? 'border-[#1D9492] bg-teal-50/50 dark:bg-teal-900/10'
                : 'border-gray-200 dark:border-white/10 hover:border-[#1D9492]/60 bg-gray-50/50 dark:bg-[#0F1420]/50'
            }`}
          >
            <input
              id="backup-file-input"
              type="file"
              accept=".json,application/json"
              className="hidden"
              onClick={(e) => { e.target.value = null; }}
              onChange={(e) => handleFileChange(e.target.files?.[0])}
            />
            <Upload className="w-8 h-8 text-[#1D9492] mx-auto mb-2 opacity-80" />
            {file ? (
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-white truncate max-w-sm mx-auto">{file.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Haz clic para seleccionar o arrastra el archivo aquí
                </p>
                <p className="text-[11px] text-gray-400 mt-1">Formato admitido: Archivo JSON (.json)</p>
              </div>
            )}
          </label>

          {parseError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-lg text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {parsedData && (
            <div className="bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-900/40 rounded-lg p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1D9492]">
                <CheckCircle className="w-4 h-4" /> Estructura de respaldo válida detectada
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 dark:text-gray-300 pt-1">
                <span>Tiendas: <strong>{conteos.tiendas}</strong></span>
                <span>Tenderos: <strong>{conteos.tenderos}</strong></span>
                <span>Productos: <strong>{conteos.productos}</strong></span>
                <span>Clientes: <strong>{conteos.clientes}</strong></span>
              </div>
            </div>
          )}

          <label className="flex items-start gap-2.5 p-3 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 cursor-pointer">
            <input
              type="checkbox"
              checked={restaurarAhora}
              onChange={(e) => setRestaurarAhora(e.target.checked)}
              className="mt-0.5 rounded text-[#1D9492] focus:ring-[#1D9492]"
            />
            <div className="text-xs">
              <span className="font-semibold text-gray-800 dark:text-gray-200 block">Restaurar inmediatamente en la base de datos</span>
              <span className="text-gray-500 dark:text-gray-400 block mt-0.5">
                Si marcas esta casilla, además de guardarse en el servidor, los datos se sincronizarán de inmediato en la base de datos actual.
              </span>
            </div>
          </label>

          <div className="pt-2 flex justify-end gap-3 border-t border-gray-100 dark:border-white/5">
            <button
              type="button"
              onClick={onClose}
              disabled={importing}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!parsedData || importing}
              className="flex items-center gap-2 px-5 py-2 bg-[#1D9492] hover:bg-[#167876] text-white rounded-lg font-semibold transition-colors shadow-sm text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {importing ? (
                <><Loader className="w-4 h-4 animate-spin" /> Procesando importación...</>
              ) : (
                <><Upload className="w-4 h-4" /> {restaurarAhora ? 'Importar y Restaurar' : 'Importar a la lista'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

// Página principal de Backups
const BackupsPage = () => {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [buscar, setBuscar] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Estados para modales de confirmación e importación
  const [backupToDelete, setBackupToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [backupToRestore, setBackupToRestore] = useState(null);
  const [restoring, setRestoring] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const data = await getBackupStats();
      setStats(data);
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadBackups = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getBackups({ page, buscar });
      setBackups(data.backups || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar el historial de backups');
    } finally {
      setLoading(false);
    }
  }, [page, buscar, toast]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    const t = setTimeout(() => loadBackups(), buscar ? 350 : 0);
    return () => clearTimeout(t);
  }, [loadBackups, buscar]);

  const handleGenerarBackup = async () => {
    try {
      setGenerating(true);
      const result = await generarBackup();
      toast.success(result.msg || 'Copia de seguridad generada exitosamente');
      await Promise.all([loadBackups(), loadStats()]);
    } catch (err) {
      toast.error(err.message || 'Error al generar la copia de seguridad');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (filename) => {
    if (!filename) return;
    try {
      setDownloading(filename);
      await downloadBackup(filename);
      toast.success('Descarga iniciada con éxito');
    } catch (err) {
      toast.error(err.message || 'Error al descargar el backup');
    } finally {
      setDownloading(null);
    }
  };

  const handleConfirmDelete = async (filename) => {
    try {
      setDeleting(true);
      const res = await deleteBackup(filename);
      toast.success(res.msg || 'Copia de seguridad eliminada con éxito');
      setBackupToDelete(null);
      await Promise.all([loadBackups(), loadStats()]);
    } catch (err) {
      toast.error(err.message || 'Error al eliminar la copia de seguridad');
    } finally {
      setDeleting(false);
    }
  };

  const handleConfirmRestore = async (filename) => {
    try {
      setRestoring(true);
      const res = await restoreBackup(filename);
      toast.success(res.msg || 'Copia de seguridad restaurada correctamente');
      setBackupToRestore(null);
      await Promise.all([loadBackups(), loadStats()]);
    } catch (err) {
      toast.error(err.message || 'Error al restaurar la copia de seguridad');
    } finally {
      setRestoring(false);
    }
  };

  const handleImportBackup = async ({ filename, content, restaurarAhora }) => {
    try {
      setImporting(true);
      const res = await importBackup({ filename, content, restaurarAhora });
      toast.success(res.msg || 'Copia de seguridad importada exitosamente');
      setIsImportModalOpen(false);
      await Promise.all([loadBackups(), loadStats()]);
    } catch (err) {
      toast.error(err.message || 'Error al importar la copia de seguridad');
    } finally {
      setImporting(false);
    }
  };

  const statCards = [
    {
      title: 'Último backup exitoso',
      value: stats?.lastSuccess || 'Ninguno registrado',
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Total de copias',
      value: stats?.totalBackups?.toLocaleString() ?? 0,
      icon: HardDrive,
      color: 'text-[#1D9492]',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20',
    },
    {
      title: 'Espacio ocupado',
      value: stats?.storageUsed || '0 B',
      icon: HardDrive,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Fallos registrados',
      value: stats?.failedThisMonth ?? 0,
      icon: AlertCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src={iconBackups} alt="Backups" className="w-9 h-9 sm:w-10 sm:h-10 object-contain flex-shrink-0" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Copias de Seguridad</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Respaldos íntegros de la base de datos descargables y restaurables.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { loadBackups(); loadStats(); }}
            title="Actualizar lista y estadísticas"
            className="p-2 rounded-md border border-white/50 dark:border-white/10 bg-white/85 dark:bg-[#1A1F2E]/80 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-white/85 dark:bg-[#1A1F2E]/80 border border-white/50 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-md transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4 text-[#1D9492]" /> Importar Backup
          </button>
          <button
            onClick={handleGenerarBackup}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 bg-[#1D9492] hover:bg-[#167876] text-white text-sm font-semibold rounded-md transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {generating ? (
              <><Loader className="w-4 h-4 animate-spin" /> Generando backup...</>
            ) : (
              <><HardDrive className="w-4 h-4" /> Generar Backup</>
            )}
          </button>
        </div>
      </div>

      {/* Estadísticas con fondo transparente estilo Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <StatCard key={i} {...s} loading={statsLoading} />
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={buscar}
            onChange={e => { setBuscar(e.target.value); setPage(1); }}
            placeholder="Buscar por nombre o descripción..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-white/50 dark:border-white/10 bg-white/85 dark:bg-[#1A1F2E]/80 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D9492]/30 focus:border-[#1D9492] transition-all shadow-sm backdrop-blur-sm"
          />
        </div>
      </div>

      {/* Timeline de backups transparente como Dashboard */}
      <div className="bg-white/85 dark:bg-[#1A1F2E]/80 rounded-md shadow-sm border border-white/50 dark:border-white/10 p-5 sm:p-6 backdrop-blur-sm transition-colors">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100 dark:border-white/5">
          <div>
            <h3 className="text-base font-bold text-gray-800 dark:text-white">Historial de respaldos reales</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Archivos JSON físicos guardados en el servidor</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#1D9492]/10 text-[#1D9492] border border-[#1D9492]/20">
            {total} {total === 1 ? 'copia registrada' : 'copias registradas'}
          </span>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="relative pl-8 pb-6">
                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                <div className="ml-4 bg-gray-100/70 dark:bg-gray-800/60 rounded-md p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : backups.length === 0 ? (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            <HardDrive className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#1D9492]" />
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No hay copias de seguridad registradas aún</p>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Presiona el botón <span className="text-[#1D9492] font-semibold">Generar Backup</span> para respaldar toda la información de la base de datos de inmediato.
            </p>
          </div>
        ) : (
          <div>
            {backups.map((b, i) => (
              <TimelineItem
                key={b.id || b.filename}
                backup={b}
                isLast={i === backups.length - 1}
                onDownload={handleDownload}
                downloading={downloading}
                onOpenRestore={(backup) => setBackupToRestore(backup)}
                onOpenDelete={(backup) => setBackupToDelete(backup)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1 bg-white/85 dark:bg-[#1A1F2E]/80 border border-white/50 dark:border-white/10 rounded-md hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            Anterior
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded-md border transition-colors shadow-sm ${
                page === i + 1
                  ? 'bg-[#1D9492] text-white border-[#1D9492]'
                  : 'bg-white/85 dark:bg-[#1A1F2E]/80 border-white/50 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 bg-white/85 dark:bg-[#1A1F2E]/80 border border-white/50 dark:border-white/10 rounded-md hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Modal de confirmación para eliminar con validación de nombre */}
      {backupToDelete && (
        <ConfirmDeleteBackupModal
          backup={backupToDelete}
          onClose={() => setBackupToDelete(null)}
          onConfirm={handleConfirmDelete}
          deleting={deleting}
        />
      )}

      {/* Modal de confirmación para restaurar backup */}
      {backupToRestore && (
        <ConfirmRestoreBackupModal
          backup={backupToRestore}
          onClose={() => setBackupToRestore(null)}
          onConfirm={handleConfirmRestore}
          restoring={restoring}
        />
      )}

      {/* Modal para importar backup externo */}
      {isImportModalOpen && (
        <ImportBackupModal
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleImportBackup}
          importing={importing}
        />
      )}
    </div>
  );
};

export default BackupsPage;