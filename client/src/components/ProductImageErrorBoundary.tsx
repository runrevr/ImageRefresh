import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component specifically for the Product Image Lab
 * Catches errors in the lab and prevents the entire app from crashing
 */
class ProductImageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error in Product Image Lab:', error, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="product-lab-card" style={{ backgroundColor: '#fff8f8', borderLeft: '4px solid #e62600' }}>
          <h2>Something went wrong in the Product Image Lab</h2>
          <p style={{ marginBottom: '1rem' }}>
            We encountered an error while processing your request. Please try the following:
          </p>
          <ul style={{ marginBottom: '1rem', marginLeft: '1.5rem' }}>
            <li>Refresh the page and try again</li>
            <li>Try uploading a different image</li>
            <li>Check your internet connection</li>
            <li>Try again in a few minutes</li>
          </ul>
          
          <details style={{ marginBottom: '1.5rem' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Error Details</summary>
            <pre style={{ 
              marginTop: '10px',
              padding: '10px',
              background: '#f5f5f5',
              borderRadius: '5px',
              overflow: 'auto',
              fontSize: '0.8rem'
            }}>
              {this.state.error?.message || 'Unknown error'}
            </pre>
          </details>
          
          <button 
            className="product-lab-button product-lab-button-primary"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ProductImageErrorBoundary;