import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Auth.css'

export default function Auth() {
  const [mode, setMode] = useState('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email.trim()) { setError('Please enter your email.'); return }
    if (!password.trim()) { setError('Please enter your password.'); return }
    if (mode === 'signup' && !name.trim()) { setError('Please enter your name.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }

    setLoading(true)

    // Temporary: store basic session in localStorage until Clerk is set up
    localStorage.setItem('biggfam_auth', 'true')
    localStorage.setItem('biggfam_user', JSON.stringify({ name: name || email.split('@')[0], email }))

    setTimeout(() => {
      navigate('/family')
    }, 300)
  }

  return (
    <div className="auth-page">
      <div className="auth-container">

        {/* Logo */}
        <div className="auth-header">
          <div className="auth-logo">
            <div className="logo-icon">🏠</div>
            <span>FamilyOS</span>
          </div>
          <h1>{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h1>
          <p>
            {mode === 'signup'
              ? "India's family OS — built for your parivar"
              : 'Sign in to your family space'}
          </p>
        </div>

        {/* Mode toggle */}
        <div className="auth-tabs">
          <button
            type="button"
            className={mode === 'signin' ? 'active' : ''}
            onClick={() => { setMode('signin'); setError('') }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={mode === 'signup' ? 'active' : ''}
            onClick={() => { setMode('signup'); setError('') }}
          >
            Sign Up
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {mode === 'signup' && (
            <div className="form-group-auth">
              <label htmlFor="auth-name">Full Name</label>
              <input
                id="auth-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Priya Patel"
                autoComplete="name"
              />
            </div>
          )}

          <div className="form-group-auth">
            <label htmlFor="auth-email">Email Address</label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="form-group-auth">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
          </div>

          <button
            type="submit"
            className="btn-auth-submit"
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading
              ? 'Please wait…'
              : mode === 'signup'
                ? 'Create My Account →'
                : 'Sign In →'}
          </button>
        </form>

        <div className="auth-footer">
          {mode === 'signin' ? (
            <p>Don't have an account?{' '}
              <button className="link-button" onClick={() => { setMode('signup'); setError('') }}>
                Sign up free
              </button>
            </p>
          ) : (
            <p>Already have an account?{' '}
              <button className="link-button" onClick={() => { setMode('signin'); setError('') }}>
                Sign in
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  )
}
