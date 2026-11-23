import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CampusGig Global Error Boundary caught:', error, errorInfo);
  }

  handleReset = () => {
    try {
      sessionStorage.clear();
      window.location.href = '/';
    } catch (e) {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          background: 'var(--bg-main, #f8fafc)',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <div style={{
            maxWidth: 480,
            background: '#fff',
            borderRadius: 16,
            padding: '2.5rem 2rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎓</div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0f172a' }}>
              CampusGig Needs a Quick Refresh
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              A temporary display error occurred. Click below to return to the marketplace home page.
            </p>
            {this.state.error && (
              <div style={{
                background: '#fee2e2',
                color: '#b91c1c',
                padding: '0.75rem',
                borderRadius: 8,
                fontSize: '0.75rem',
                textAlign: 'left',
                fontFamily: 'monospace',
                marginBottom: '1.25rem',
                maxHeight: 140,
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {String(this.state.error?.stack || this.state.error?.message || this.state.error)}
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={this.handleReset}
                style={{
                  background: 'linear-gradient(135deg, #0A5FD6 0%, #1A7FE8 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                🏠 Return to Marketplace Home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>
);

