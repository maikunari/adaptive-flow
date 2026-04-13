import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('App crashed:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  handleClearAndReload = () => {
    localStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FBFBFD] p-8">
          <div className="text-center space-y-4 max-w-md">
            <h1 className="text-3xl font-semibold tracking-tight">Something went wrong</h1>
            <p className="text-gray-400 text-lg">The app encountered an unexpected error.</p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 rounded-full bg-[#1D1D1F] text-white font-semibold hover:bg-[#2D2D2F] transition-all"
              >
                Try Again
              </button>
              <button
                onClick={this.handleClearAndReload}
                className="px-6 py-3 rounded-full border border-gray-200 text-gray-500 font-semibold hover:border-gray-300 hover:text-gray-700 transition-all"
              >
                Reset App
              </button>
            </div>
            <p className="text-xs text-gray-300">Reset clears all tasks and reloads the app.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
