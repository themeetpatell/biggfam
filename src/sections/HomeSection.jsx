import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/react'
import { useFamily } from '../contexts/FamilyContext.jsx'
import { dashboard as dashboardApi } from '../lib/api.js'
import { formatINR } from '../hooks/useExpenses.js'
import SectionSkeleton from '../components/SectionSkeleton.jsx'
import { useNavigate } from 'react-router-dom'

const HOUR = new Date().getHours()
const GREETING = HOUR < 12 ? 'Good morning' : HOUR < 17 ? 'Good afternoon' : 'Good evening'

export default function HomeSection() {
  const { family, members } = useFamily()
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!family?.id) return
    async function load() {
      try {
        const token = await getToken()
        const res = await dashboardApi.get(family.id, token)
        setData(res)
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    load()
  }, [family?.id])

  if (loading) return <SectionSkeleton rows={6} />

  return (
    <div style={{ maxWidth: '720px' }}>
      <div style={{ background: 'linear-gradient(135deg, #1A2E5C, #2A4E8C)', borderRadius: '16px', padding: '20px 24px', marginBottom: '20px', color: '#fff' }}>
        <p style={{ margin: '0 0 4px', fontSize: '14px', opacity: 0.75 }}>{GREETING}!</p>
        <p style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>{family?.name}</p>
        <p style={{ margin: '8px 0 0', fontSize: '15px', opacity: 0.85 }}>
          {members.length} member{members.length !== 1 ? 's' : ''} · {family?.city || 'Your family space'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '24px' }}>
        {[
          { label: '+ Expense', path: '/family/wealth', emoji: '💸' },
          { label: '+ Event', path: '/family/calendar', emoji: '📅' },
          { label: '+ Note', path: '/family/bulletin', emoji: '📌' },
          { label: 'Ask Maahi', path: '/family/maahi', emoji: '🤖' },
        ].map(a => (
          <button key={a.path} onClick={() => navigate(a.path)} style={{ height: '72px', background: '#fff', border: '1px solid #E0DDD8', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer', fontSize: '13px', color: '#333', fontWeight: 500 }}>
            <span style={{ fontSize: '20px' }}>{a.emoji}</span>
            {a.label}
          </button>
        ))}
      </div>

      {data?.events?.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #E0DDD8', borderRadius: '12px', padding: '16px 20px', marginBottom: '16px' }}>
          <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: '16px', color: '#1A2E5C' }}>Upcoming</p>
          {data.events.slice(0, 3).map(e => (
            <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F5F3EE' }}>
              <span style={{ fontSize: '15px', color: '#333' }}>{e.title}</span>
              <span style={{ fontSize: '13px', color: '#888' }}>{new Date(e.start_time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
            </div>
          ))}
        </div>
      )}

      {data?.monthlyExpenseTotal > 0 && (
        <div style={{ background: '#fff', border: '1px solid #E0DDD8', borderRadius: '12px', padding: '16px 20px', marginBottom: '16px' }}>
          <p style={{ margin: '0 0 4px', fontSize: '14px', color: '#666' }}>This month's spending</p>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#1A2E5C' }}>{formatINR(data.monthlyExpenseTotal)}</p>
        </div>
      )}

      {data?.goals?.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #E0DDD8', borderRadius: '12px', padding: '16px 20px' }}>
          <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: '16px', color: '#1A2E5C' }}>Goals</p>
          {data.goals.map(g => {
            const pct = g.target_amount > 0 ? Math.round((g.current_amount / g.target_amount) * 100) : 0
            return (
              <div key={g.id} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '15px', color: '#333' }}>{g.title}</span>
                  <span style={{ fontSize: '13px', color: '#666' }}>{pct}%</span>
                </div>
                <div style={{ background: '#F5F3EE', borderRadius: '4px', height: '6px' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: '#E67E22', borderRadius: '4px' }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
