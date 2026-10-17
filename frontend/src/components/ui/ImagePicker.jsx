import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Link as LinkIcon, Loader2 } from 'lucide-react';

/**
 * Redimensiona y comprime una imagen seleccionada para optimizar el tamaño en base64
 * Genera un Data URL de ~20KB - 40KB que no satura el backend ni la base de datos.
 */
const compressImage = (file, maxWidth = 500, maxHeight = 500, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('El archivo seleccionado no es una imagen válida.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Error al leer el archivo.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Error al procesar la imagen.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target.result); // Fallback
          return;
        }

        // Fondo blanco para imágenes transparentes que se guarden como JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a JPEG optimizado
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

const ImagePicker = ({ label, value, onChange, placeholder = 'URL o sube una imagen' }) => {
  const [mode, setMode] = useState(value && value.startsWith('data:') ? 'file' : 'url');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    setIsProcessing(true);

    try {
      // Soporta archivos de hasta 10MB porque los comprime a < 50KB automáticamente
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('El archivo supera los 10MB permitidos.');
      }

      const compressedDataUrl = await compressImage(file, 500, 500, 0.8);
      onChange(compressedDataUrl);
    } catch (err) {
      setError(err.message || 'Error al procesar la imagen');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    onChange('');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <div className="flex gap-1 text-[11px] bg-gray-100 dark:bg-gray-800 p-0.5 rounded-lg">
          <button
            type="button"
            onClick={() => { setMode('file'); setError(''); }}
            className={`px-2 py-0.5 rounded-md font-medium transition-all ${
              mode === 'file'
                ? 'bg-white dark:bg-[#1A1F2E] text-teal-600 dark:text-teal-400 shadow-xs'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Subir Archivo
          </button>
          <button
            type="button"
            onClick={() => { setMode('url'); setError(''); }}
            className={`px-2 py-0.5 rounded-md font-medium transition-all ${
              mode === 'url'
                ? 'bg-white dark:bg-[#1A1F2E] text-teal-600 dark:text-teal-400 shadow-xs'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            URL
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Previsualización */}
        <div className="w-14 h-14 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 flex-shrink-0 flex items-center justify-center overflow-hidden relative group">
          {isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
          ) : value ? (
            <>
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={handleClear}
                title="Quitar imagen"
                className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <ImageIcon className="w-6 h-6 text-gray-400" />
          )}
        </div>

        {/* Input según modo */}
        <div className="flex-1">
          {mode === 'file' ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleFileChange}
                className="hidden"
                id={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
              />
              <label
                htmlFor={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
                className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700/80 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 cursor-pointer transition-colors"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                ) : (
                  <Upload className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                )}
                <span className="truncate">
                  {isProcessing
                    ? 'Optimizando imagen...'
                    : value && value.startsWith('data:')
                    ? 'Cambiar imagen'
                    : 'Seleccionar desde tu equipo'}
                </span>
              </label>
            </div>
          ) : (
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400">
                <LinkIcon className="w-4 h-4" />
              </span>
              <input
                type="url"
                value={value && !value.startsWith('data:') ? value : ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none text-sm"
              />
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};

export default ImagePicker;
