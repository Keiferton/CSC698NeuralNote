import React from 'react';
import './ErrorBoundary.css';
import { FaExclamationTriangle } from 'react-icons/fa';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    // Reset error state
    // Note: React Error Boundaries cannot automatically recover from errors.
    // The component tree that threw the error must be remounted by the parent.
    // In real apps, "Try Again" typically triggers navigation or state changes
    // that cause the parent to remount the component tree with a new key.
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <h2><FaExclamationTriangle /> Something went wrong</h2>
            <p>We encountered an unexpected error. Please try refreshing the page.</p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>Error details (development only)</summary>
                <pre>{this.state.error.toString()}</pre>
              </details>
            )}
            <button onClick={this.handleReset} className="error-reset-btn">
              Try Again
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="error-reset-btn"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

