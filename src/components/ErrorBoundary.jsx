import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</p>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '20px' }}>
            Something went wrong in this section.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              background: 'none', border: '1px solid #E0DDD8', borderRadius: '8px',
              padding: '10px 20px', cursor: 'pointer', fontSize: '15px', color: '#333'
            }}
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
