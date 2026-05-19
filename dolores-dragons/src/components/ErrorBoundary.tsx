import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'Ha ocurrido un error inesperado.';
      
      try {
        // Check if it's a Firestore error JSON
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.operationType) {
            errorMessage = 'Error de conexión con la base de datos. Por favor, inténtalo de nuevo más tarde.';
          }
        }
      } catch (e) {
        // Not a JSON error, keep default message
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="bg-surface border border-white/10 p-8 rounded-2xl max-w-md w-full text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
            
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
                ¡Ups! Algo salió mal
              </h2>
              <p className="text-text-muted">
                {errorMessage}
              </p>
            </div>

            <button
              onClick={this.handleReset}
              className="w-full py-3 bg-primary hover:bg-primary/90 text-[#000000] rounded-xl font-bold transition-all flex items-center justify-center gap-2 group"
            >
              <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              Recargar página
            </button>
            
            <p className="text-[10px] text-white/20 uppercase tracking-widest">
              Dolores Dragons Basketball Club
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
