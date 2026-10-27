import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturó un error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="bg-white/90 dark:bg-[#1A1F2E]/90 border border-red-200 dark:border-red-900/40 rounded-2xl p-6 sm:p-8 max-w-lg w-full text-center shadow-lg backdrop-blur-md space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Ocurrió un problema al cargar esta sección
            </h2>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              {this.state.error?.message || 'Error inesperado en el componente.'}
            </p>

            {this.state.error?.stack && (
              <pre className="text-[11px] p-3 rounded-lg bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/5 text-left text-red-600 dark:text-red-400 overflow-x-auto max-h-32">
                {this.state.error.stack}
              </pre>
            )}

            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1D9492] hover:bg-[#167876] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
