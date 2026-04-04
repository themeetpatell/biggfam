import { useState } from 'react'
import { SignIn, SignUp } from '@clerk/react'
import './Auth.css'

export default function Auth() {
  const [mode, setMode] = useState('signin')

  return (
    <div className="auth-page">
      <div className="auth-container">

        <div className="auth-header">
          <div className="auth-logo">
            <div className="logo-icon">🏠</div>
            <span>BiggFam</span>
          </div>
          <h1>{mode === 'signin' ? 'Welcome back' : 'Join BiggFam'}</h1>
          <p>
            {mode === 'signin'
              ? 'Sign in to your family space'
              : "India's family OS — built for your parivar"}
          </p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === 'signin' ? 'active' : ''}
            onClick={() => setMode('signin')}
          >
            Sign In
          </button>
          <button
            type="button"
            className={mode === 'signup' ? 'active' : ''}
            onClick={() => setMode('signup')}
          >
            Sign Up
          </button>
        </div>

        <div className="clerk-widget-wrapper">
          {mode === 'signin' ? (
            <SignIn
              appearance={{
                variables: { colorPrimary: '#E67E22' },
                elements: {
                  card: 'clerk-card',
                  formButtonPrimary: 'clerk-btn-primary',
                }
              }}
              afterSignInUrl="/family"
              routing="hash"
            />
          ) : (
            <SignUp
              appearance={{
                variables: { colorPrimary: '#E67E22' },
                elements: {
                  card: 'clerk-card',
                  formButtonPrimary: 'clerk-btn-primary',
                }
              }}
              afterSignUpUrl="/family"
              routing="hash"
            />
          )}
        </div>

      </div>
    </div>
  )
}
