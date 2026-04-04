import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import { families as familiesApi } from '../lib/api.js'

export default function JoinFamily() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState('loading') // loading | info | joining | success | error
  const [familyName, setFamilyName] = useState('')
  const [error, setError] = useState('')
  const { isLoaded, isSignedIn, getToken } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) { setStatus('error'); setError('Invalid invite link.'); return }
    if (!isLoaded) return

    if (!isSignedIn) {
      sessionStorage.setItem('pendingInviteToken', token)
      navigate('/auth')
      return
    }

    async function fetchInfo() {
      try {
        const { family_name } = await familiesApi.getInviteInfo(token)
        setFamilyName(family_name)
        setStatus('info')
      } catch (err) {
        setStatus('error')
        setError(err.message)
      }
    }
    fetchInfo()
  }, [token, isLoaded, isSignedIn])

  async function handleJoin() {
    setStatus('joining')
    try {
      const authToken = await getToken()
      await familiesApi.join(token, authToken)
      setStatus('success')
      setTimeout(() => navigate('/family'), 1500)
    } catch (err) {
      setStatus('error')
      setError(err.message)
    }
  }

  if (status === 'loading') return (
    <div style={centerStyle}><p style={{ color: '#888', fontSize: '18px' }}>Loading invite…</p></div>
  )

  if (status === 'success') return (
    <div style={centerStyle}>
      <p style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</p>
      <h2 style={{ color: '#1A2E5C', marginBottom: '8px' }}>Joined!</h2>
      <p style={{ color: '#666' }}>Taking you to {familyName}…</p>
    </div>
  )

  if (status === 'error') return (
    <div style={centerStyle}>
      <p style={{ fontSize: '48px', marginBottom: '12px' }}>😕</p>
      <h2 style={{ color: '#CC0000', marginBottom: '8px' }}>Something went wrong</h2>
      <p style={{ color: '#666' }}>{error}</p>
      <button onClick={() => navigate('/')} style={{ marginTop: '16px', padding: '12px 24px', background: '#E67E22', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Go Home</button>
    </div>
  )

  return (
    <div style={centerStyle}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '40px 32px', maxWidth: '400px', width: '100%', border: '1px solid #E0DDD8', textAlign: 'center' }}>
        <p style={{ fontSize: '48px', marginBottom: '12px' }}>👨‍👩‍👧‍👦</p>
        <h2 style={{ color: '#1A2E5C', margin: '0 0 8px' }}>You're invited!</h2>
        <p style={{ color: '#666', margin: '0 0 24px' }}>Join <strong>{familyName}</strong> on BiggFam</p>
        <button
          onClick={handleJoin}
          disabled={status === 'joining'}
          style={{ width: '100%', height: '52px', background: '#E67E22', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '16px' }}
        >
          {status === 'joining' ? 'Joining…' : `Join ${familyName} →`}
        </button>
      </div>
    </div>
  )
}

const centerStyle = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F3EE', padding: '24px' }
