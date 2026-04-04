import { useState } from 'react'
import { useAuth } from '@clerk/react'
import { useFamily } from '../contexts/FamilyContext.jsx'
import { families as familiesApi } from '../lib/api.js'

export default function Onboarding() {
  const [step, setStep] = useState(1)
  const [familyName, setFamilyName] = useState('')
  const [city, setCity] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [inviteToken, setInviteToken] = useState(null)
  const { getToken } = useAuth()
  const { refetch } = useFamily()

  async function handleCreate() {
    if (!familyName.trim()) { setError('Please enter your family name'); return }
    setError('')
    setCreating(true)
    try {
      const token = await getToken()
      const { family } = await familiesApi.create(
        { name: familyName.trim(), city: city.trim() || undefined },
        token
      )
      // Generate invite token
      const { token: invTok } = await familiesApi.createInvite(family.id, token)
      setInviteToken(invTok)
      setStep(2)
    } catch (err) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  const inviteLink = inviteToken ? `${window.location.origin}/join?token=${inviteToken}` : ''

  async function handleFinish() {
    await refetch()
  }

  if (step === 2) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '16px' }}>👨‍👩‍👧‍👦</div>
          <h1 style={titleStyle}>{familyName} is ready!</h1>
          <p style={subtitleStyle}>Invite your family to join. The more, the better!</p>

          <div style={{ background: '#F5F3EE', borderRadius: '8px', padding: '12px 16px', margin: '20px 0', wordBreak: 'break-all', fontSize: '13px', color: '#555' }}>
            {inviteLink}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => {
                const msg = encodeURIComponent(`I've set up our family space on BiggFam. Join here: ${inviteLink}`)
                window.open(`https://wa.me/?text=${msg}`, '_blank')
              }}
              style={primaryBtnStyle}
            >
              Share via WhatsApp
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(inviteLink)}
              style={ghostBtnStyle}
            >
              Copy link
            </button>
            <button onClick={handleFinish} style={{ ...ghostBtnStyle, color: '#888', borderColor: 'transparent' }}>
              Skip for now
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '16px' }}>🏠</div>
        <h1 style={titleStyle}>Namaste!</h1>
        <p style={subtitleStyle}>Let's set up your family space.</p>

        {error && (
          <div style={{ background: '#FFF0F0', border: '1px solid #CC0000', borderRadius: '8px', padding: '12px', marginBottom: '16px', color: '#CC0000', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle} htmlFor="family-name">Family Name *</label>
          <input
            id="family-name"
            type="text"
            value={familyName}
            onChange={e => setFamilyName(e.target.value)}
            placeholder="e.g. Patel Parivar"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '28px' }}>
          <label style={labelStyle} htmlFor="family-city">City (optional)</label>
          <input
            id="family-city"
            type="text"
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="e.g. Mumbai"
            style={inputStyle}
          />
        </div>

        <button
          onClick={handleCreate}
          disabled={creating || !familyName.trim()}
          style={{ ...primaryBtnStyle, opacity: creating || !familyName.trim() ? 0.5 : 1 }}
        >
          {creating ? 'Creating…' : 'Create My Family →'}
        </button>
      </div>
    </div>
  )
}

const containerStyle = {
  minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: '#F5F3EE', padding: '24px',
}
const cardStyle = {
  background: '#fff', borderRadius: '16px', padding: '40px 32px',
  maxWidth: '440px', width: '100%', border: '1px solid #E0DDD8',
}
const titleStyle = {
  fontSize: '26px', fontWeight: 700, color: '#1A2E5C',
  margin: '0 0 8px', textAlign: 'center',
}
const subtitleStyle = {
  fontSize: '16px', color: '#666', margin: '0 0 28px', textAlign: 'center',
}
const labelStyle = {
  display: 'block', fontSize: '14px', fontWeight: 500,
  color: '#333', marginBottom: '8px',
}
const inputStyle = {
  width: '100%', height: '52px', border: '1px solid #E0DDD8',
  borderRadius: '8px', padding: '0 14px', fontSize: '16px',
  outline: 'none', boxSizing: 'border-box',
}
const primaryBtnStyle = {
  width: '100%', height: '52px', background: '#E67E22', color: '#fff',
  border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 600,
  cursor: 'pointer',
}
const ghostBtnStyle = {
  width: '100%', height: '48px', background: '#fff', color: '#333',
  border: '1px solid #E0DDD8', borderRadius: '8px', fontSize: '15px',
  cursor: 'pointer',
}
