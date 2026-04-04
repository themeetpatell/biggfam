import { useClerk, useUser } from '@clerk/react'
import { useNavigate } from 'react-router-dom'
import { useFamily } from '../contexts/FamilyContext.jsx'

export default function SettingsSection() {
  const { signOut } = useClerk()
  const { user } = useUser()
  const { family, members } = useFamily()
  const navigate = useNavigate()

  function handleSignOut() {
    signOut(() => navigate('/auth'))
  }

  return (
    <div style={{ maxWidth: '560px' }}>
      <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#1A2E5C', margin: '0 0 24px' }}>Settings</h1>

      <div style={{ background: '#fff', border: '1px solid #E0DDD8', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
        <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '16px', color: '#1A1A1A' }}>{user?.fullName || 'Family Member'}</p>
        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{user?.primaryEmailAddress?.emailAddress}</p>
      </div>

      {family && (
        <div style={{ background: '#fff', border: '1px solid #E0DDD8', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
          <p style={{ margin: '0 0 12px', fontWeight: 600, fontSize: '16px', color: '#1A1A1A' }}>{family.name}</p>
          <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#666' }}>{members.length} member{members.length !== 1 ? 's' : ''}{family.city ? ` · ${family.city}` : ''}</p>
          {members.map(m => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderTop: '1px solid #F5F3EE' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#E67E22', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px' }}>
                {m.name.charAt(0)}
              </div>
              <div>
                <p style={{ margin: '0', fontSize: '15px', fontWeight: 500, color: '#1A1A1A' }}>{m.name}</p>
                <p style={{ margin: '0', fontSize: '13px', color: '#888' }}>{m.role} {m.relationship ? `· ${m.relationship}` : ''}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleSignOut}
        style={{ width: '100%', height: '48px', background: '#fff', color: '#CC0000', border: '1px solid #CC0000', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '15px' }}
      >
        Sign Out
      </button>
    </div>
  )
}
