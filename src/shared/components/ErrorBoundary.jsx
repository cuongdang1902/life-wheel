import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('App crashed:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#0f172a', color: '#f1f5f9', padding: '2rem', fontFamily: 'monospace'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💥</div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#f87171' }}>App gặp lỗi</h1>
          <pre style={{
            background: '#1e293b', padding: '1rem', borderRadius: '0.5rem',
            maxWidth: '90vw', overflow: 'auto', fontSize: '0.8rem', color: '#fbbf24'
          }}>
            {this.state.error?.toString()}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1.5rem', padding: '0.5rem 1.5rem',
              background: '#6366f1', color: 'white', border: 'none',
              borderRadius: '0.5rem', cursor: 'pointer', fontSize: '1rem'
            }}
          >
            🔄 Tải lại
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
