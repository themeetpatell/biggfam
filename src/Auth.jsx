import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Auth.css'

const Auth = () => {
  const [mode, setMode] = useState('signup')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (mode === 'signup') {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return
      }
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters')
        return
      }
      console.log('Sign up:', formData)
      localStorage.setItem('biggfam_auth', 'true')
      navigate('/family')
    } else if (mode === 'login') {
      console.log('Login:', { email: formData.email, password: formData.password })
      localStorage.setItem('biggfam_auth', 'true')
      navigate('/family')
    } else if (mode === 'reset') {
      console.log('Reset password for:', formData.email)
      setError('Password reset link sent to your email')
      setTimeout(() => {
        setMode('login')
        setError('')
      }, 3000)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="logo-icon">F</div>
            <span>BiggFam</span>
          </div>
          <h1>
            {mode === 'signup' && 'Create Your Account'}
            {mode === 'login' && 'Welcome Back'}
            {mode === 'reset' && 'Reset Password'}
          </h1>
          <p>
            {mode === 'signup' && 'Start building your legendary family today'}
            {mode === 'login' && 'Sign in to your BiggFam account'}
            {mode === 'reset' && 'Enter your email to reset your password'}
          </p>
        </div>

        <div className="auth-tabs">
          <button 
            className={mode === 'signup' ? 'active' : ''}
            onClick={() => {
              setMode('signup')
              setError('')
            }}
          >
            Sign Up
          </button>
          <button 
            className={mode === 'login' ? 'active' : ''}
            onClick={() => {
              setMode('login')
              setError('')
            }}
          >
            Sign In
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="form-group-auth">
              <label>Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="John Doe"
              />
            </div>
          )}

          <div className="form-group-auth">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="your@email.com"
            />
          </div>

          {mode !== 'reset' && (
            <div className="form-group-auth">
              <label>Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder={mode === 'signup' ? 'At least 8 characters' : 'Enter your password'}
              />
            </div>
          )}

          {mode === 'signup' && (
            <div className="form-group-auth">
              <label>Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                placeholder="Confirm your password"
              />
            </div>
          )}

          {mode === 'login' && (
            <div className="auth-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                className="forgot-password-link"
                onClick={() => {
                  setMode('reset')
                  setError('')
                }}
              >
                Forgot password?
              </button>
            </div>
          )}

          <button type="submit" className="btn-auth-submit">
            {mode === 'signup' && 'Create Account'}
            {mode === 'login' && 'Sign In'}
            {mode === 'reset' && 'Send Reset Link'}
          </button>
        </form>

        {mode === 'signup' && (
          <div className="auth-footer">
            <p>By signing up, you agree to our <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a></p>
          </div>
        )}

        {mode === 'login' && (
          <div className="auth-footer">
            <p>Don't have an account? <button className="link-button" onClick={() => setMode('signup')}>Sign up</button></p>
          </div>
        )}

        {mode === 'reset' && (
          <div className="auth-footer">
            <p>Remember your password? <button className="link-button" onClick={() => setMode('login')}>Sign in</button></p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Auth

