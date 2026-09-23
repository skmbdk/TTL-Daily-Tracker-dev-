import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] w-full flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full rounded-2xl border border-rose-500/20 bg-rose-500/10 p-8 backdrop-blur-md shadow-xl space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <AlertTriangle size={28} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">View encountered an issue</h3>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                {this.state.error?.message || 'An unexpected rendering error occurred in this view.'}
              </p>
            </div>
            <button
              type="button"
              onClick={this.handleReset}
              className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold"
            >
              <RotateCcw size={14} />
              Reload View
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
