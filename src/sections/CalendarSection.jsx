import { useState } from 'react'
import { useEvents } from '../hooks/useEvents.js'
import EmptyState from '../components/EmptyState.jsx'
import SectionSkeleton from '../components/SectionSkeleton.jsx'

const EVENT_TYPES = ['Festival', 'Medical', 'School', 'EMI', 'Birthday', 'General']
const TYPE_COLORS = { Festival: '#9333EA', Medical: '#CC0000', School: '#2563EB', EMI: '#C0622A', Birthday: '#DB2777', General: '#666' }

const FESTIVALS = [
  { id: 'holi-2026', title: 'Holi', start_time: '2026-03-24T00:00:00', event_type: 'Festival', system: true },
  { id: 'diwali-2025', title: 'Diwali', start_time: '2025-10-20T00:00:00', event_type: 'Festival', system: true },
  { id: 'eid-2026', title: 'Eid al-Fitr', start_time: '2026-03-31T00:00:00', event_type: 'Festival', system: true },
]

export default function CalendarSection() {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString()
  const { events, loading, error, refetch, createEvent } = useEvents(monthStart, monthEnd)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', event_type: 'General', start_time: '', location: '' })
  const [saving, setSaving] = useState(false)

  async function handleCreate() {
    if (!form.title.trim() || !form.start_time) return
    setSaving(true)
    try {
      await createEvent({ ...form })
      setForm({ title: '', event_type: 'General', start_time: '', location: '' })
      setShowForm(false)
    } finally { setSaving(false) }
  }

  if (loading) return <SectionSkeleton rows={4} />
  if (error) return <div style={{ padding: '24px', color: '#CC0000' }}>{error} <button onClick={refetch}>Retry</button></div>

  const allEvents = [...FESTIVALS, ...events].sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
  const upcomingEvents = allEvents.filter(e => new Date(e.start_time) >= new Date(Date.now() - 24*60*60*1000))

  return (
    <div className="section-content" style={{ maxWidth: '720px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#1A2E5C', margin: 0 }}>Saath Mein</h1>
        <button onClick={() => setShowForm(true)} style={primaryBtnStyle}>+ Event</button>
      </div>

      {showForm && (
        <div style={formCardStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle} htmlFor="evt-title">Event name *</label>
              <input id="evt-title" type="text" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="e.g. Doctor appointment" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle} htmlFor="evt-date">Date & time *</label>
              <input id="evt-date" type="datetime-local" value={form.start_time} onChange={e => setForm(p => ({...p, start_time: e.target.value}))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle} htmlFor="evt-type">Type</label>
              <select id="evt-type" value={form.event_type} onChange={e => setForm(p => ({...p, event_type: e.target.value}))} style={inputStyle}>
                {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle} htmlFor="evt-loc">Location (optional)</label>
              <input id="evt-loc" type="text" value={form.location} onChange={e => setForm(p => ({...p, location: e.target.value}))} placeholder="e.g. Apollo Hospital, Bandra" style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleCreate} disabled={saving || !form.title.trim() || !form.start_time} style={{ ...primaryBtnStyle, flex: 1, opacity: saving || !form.title || !form.start_time ? 0.5 : 1 }}>
              {saving ? 'Saving…' : 'Add Event'}
            </button>
            <button onClick={() => setShowForm(false)} style={ghostBtnStyle}>Cancel</button>
          </div>
        </div>
      )}

      {upcomingEvents.length === 0 ? (
        <EmptyState icon="📅" title="No upcoming events" description="Add family events, appointments, and festivals to keep everyone in sync." cta="Add first event" onAction={() => setShowForm(true)} />
      ) : (
        upcomingEvents.map(evt => (
          <div key={evt.id} style={{ background: '#fff', border: '1px solid #E0DDD8', borderLeft: `4px solid ${TYPE_COLORS[evt.event_type] || '#666'}`, borderRadius: '12px', padding: '14px 20px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: TYPE_COLORS[evt.event_type] || '#666', background: '#F5F3EE', borderRadius: '4px', padding: '2px 8px' }}>
                    {evt.event_type}
                  </span>
                  {evt.system && <span style={{ fontSize: '11px', color: '#888' }}>🇮🇳 National festival</span>}
                </div>
                <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: '15px', color: '#1A1A1A' }}>{evt.title}</p>
                <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>
                  {new Date(evt.start_time).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                  {evt.location && ` · ${evt.location}`}
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

const primaryBtnStyle = { background: '#E67E22', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 20px', height: '48px', fontWeight: 600, cursor: 'pointer', fontSize: '15px' }
const ghostBtnStyle = { background: '#fff', color: '#333', border: '1px solid #E0DDD8', borderRadius: '8px', padding: '0 20px', height: '48px', cursor: 'pointer', fontSize: '15px' }
const formCardStyle = { background: '#fff', border: '1px solid #E0DDD8', borderRadius: '12px', padding: '20px', marginBottom: '20px' }
const labelStyle = { display: 'block', fontSize: '14px', fontWeight: 500, color: '#333', marginBottom: '8px' }
const inputStyle = { width: '100%', height: '52px', border: '1px solid #E0DDD8', borderRadius: '8px', padding: '0 14px', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }
