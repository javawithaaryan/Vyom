import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Vyom UI error:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-stone-50">
          <div className="max-w-md w-full glass-card p-8 rounded-2xl text-center">
            <span className="material-symbols-outlined text-4xl text-amber-600 mb-3">error_outline</span>
            <h1 className="text-lg font-bold text-stone-900">Something went wrong</h1>
            <p className="text-sm text-stone-600 mt-2 leading-relaxed">
              The app hit an unexpected error. Your data is safe—you can reload or try again.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="mt-4 text-left text-xs bg-stone-100 p-3 rounded-lg overflow-auto max-h-32 text-red-800">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
              <button type="button" onClick={this.handleRetry} className="form-btn px-6">
                Try again
              </button>
              <button
                type="button"
                onClick={() => window.location.assign('/')}
                className="px-6 py-3 text-sm font-semibold border border-stone-200 rounded-lg hover:bg-stone-100 min-h-[44px]"
              >
                Go home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
