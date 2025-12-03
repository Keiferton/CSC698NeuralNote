import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

// Component that throws an error for testing
class ThrowError extends React.Component {
  render() {
    throw new Error('Test error');
  }
}

// Component that throws an error based on prop
class ConditionalError extends React.Component {
  render() {
    if (this.props.shouldThrow) {
      throw new Error('Conditional error');
    }
    return <div>No error</div>;
  }
}

// Suppress console.error for cleaner test output
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Clear any previous state
    jest.clearAllMocks();
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
    expect(screen.queryByText(/Something went wrong/i)).not.toBeInTheDocument();
  });

  it('should catch errors and display error UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/We encountered an unexpected error/i)).toBeInTheDocument();
  });

  it('should log error to console', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(consoleSpy).toHaveBeenCalledWith(
      'ErrorBoundary caught an error:',
      expect.any(Error),
      expect.any(Object)
    );
    
    consoleSpy.mockRestore();
  });

  it('should show error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    const detailsElement = screen.getByText(/Error details \(development only\)/i);
    expect(detailsElement).toBeInTheDocument();
    
    process.env.NODE_ENV = originalEnv;
  });

  it('should not show error details in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.queryByText(/Error details/i)).not.toBeInTheDocument();
    
    process.env.NODE_ENV = originalEnv;
  });

  it('should have Try Again button that resets error state', () => {
    const { container, rerender } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    
    const tryAgainButton = screen.getByText(/Try Again/i);
    expect(tryAgainButton).toBeInTheDocument();
    
    // Click Try Again button - this resets the error state internally
    fireEvent.click(tryAgainButton);
    
    // After reset, if we render a component that doesn't throw, it should work
    rerender(
      <ErrorBoundary>
        <div>No error content</div>
      </ErrorBoundary>
    );
    
    // Error boundary should now show children since error state was reset
    expect(screen.getByText('No error content')).toBeInTheDocument();
    expect(screen.queryByText(/Something went wrong/i)).not.toBeInTheDocument();
  });

  it('should have Reload Page button', () => {
    // Mock window.location.reload
    const reloadMock = jest.fn();
    delete window.location;
    window.location = { reload: reloadMock };
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    const reloadButton = screen.getByText(/Reload Page/i);
    expect(reloadButton).toBeInTheDocument();
    
    fireEvent.click(reloadButton);
    
    expect(reloadMock).toHaveBeenCalled();
  });

  it('should handle multiple errors sequentially', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    
    // Reset error
    const tryAgainButton = screen.getByText(/Try Again/i);
    fireEvent.click(tryAgainButton);
    
    // Throw error again
    rerender(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
  });
});

