// src/components/modules/Vendors/VendorsPagination.jsx
import { ChevronLeft, ChevronRight } from 'lucide-react';

const VendorsPagination = ({ currentPage = 1, totalPages = 5, onPageChange }) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 mt-4">
      <div className="text-sm text-gray-500">
        Mostrando 1–4 de 12 tenderos
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {[...Array(totalPages).keys()].map((num) => (
          <button
            key={num + 1}
            onClick={() => onPageChange(num + 1)}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              currentPage === num + 1
                ? 'bg-brand-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {num + 1}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
export default VendorsPagination;