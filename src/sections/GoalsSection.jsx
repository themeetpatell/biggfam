import { useState } from 'react'
import { useGoals } from '../hooks/useGoals.js'
import { formatINR } from '../hooks/useExpenses.js'
import EmptyState from '../components/EmptyState.jsx'
import SectionSkeleton from '../components/SectionSkeleton.jsx'

export default function GoalsSection() {
  const { goals, loading, error, refetch, createGoal, contribute } = useGoals()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', target_amount: '', target_date: '' })
  const [saving, setSaving] = useState(false)
  const [contributeModal, setContributeModal] = useState(null)
  const [contribAmount, setContribAmount] = useState('')

  async function handleCreate() {
    if (!form.title.trim() || !form.target_amount) return
    setSaving(true)
    try {
      await createGoal({ ...form, target_amount: Number(form.target_amount) })
      setForm({ title: '', description: '', target_amount: '', target_date: '' })
      setShowForm(false)
    } finally { setSaving(false) }
  }

  async function handleContribute() {
    if (!contribAmount || !contributeModal) return
    await contribute(contributeModal, Number(contribAmount))
    setContribAmount('')
    setContributeModal(null)
  }

  if (loading) return <SectionSkeleton rows={3} />
  if (error) return <div style={{ padding: '24px', color: '#CC0000' }}>{error} <button onClick={refetch}>Retry</button></div>

  return (
    <div className="section-content" style={{ maxWidth: '720px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#1A2E5C', margin: 0 }}>Sapne</h1>
        <button onClick={() => setShowForm(true)} style={primaryBtnStyle}>+ Goal</button>
      </div>

      {showForm && (
        <div style={formCardStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle} htmlFor="goal-title">Goal name *</label>
              <input id="goal-title" type="text" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="e.g. Family trip to Goa" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle} htmlFor="goal-amount">Target amount (₹) *</label>
              <input id="goal-amount" type="number" value={form.target_amount} onChange={e => setForm(p => ({...p, target_amount: e.target.value}))} placeholder="100000" style={inputStyle} min="0" />
            </div>
            <div>
              <label style={labelStyle} htmlFor="goal-date">Target date (optional)</label>
              <input id="goal-date" type="date" value={form.target_date} onChange={e => setForm(p => ({...p, target_date: e.target.value}))} style={inputStyle} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle} htmlFor="goal-desc">Description (optional)</label>
              <input id="goal-desc" type="text" value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} placeholder="What's this goal for?" style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleCreate} disabled={saving || !form.title.trim() || !form.target_amount} style={{ ...primaryBtnStyle, flex: 1, opacity: saving || !form.title || !form.target_amount ? 0.5 : 1 }}>
              {saving ? 'Saving…' : 'Create Goal'}
            </button>
            <button onClick={() => setShowForm(false)} style={ghostBtnStyle}>Cancel</button>
          </div>
        </div>
      )}

      {goals.length === 0 ? (
        <EmptyState icon="🌟" title="No goals yet" description="Save together as a family — for a trip, wedding, home, or education." cta="Create first goal" onAction={() => setShowForm(true)} />
      ) : (
        goals.map(goal => {
          const pct = goal.target_amount > 0 ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100)) : 0
          return (
            <div key={goal.id} style={{ background: '#fff', border: '1px solid #E0DDD8', borderRadius: '12px', padding: '20px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '17px', color: '#1A2E5C' }}>{goal.title}</p>
                  {goal.description && <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{goal.description}</p>}
                </div>
                <span style={{ fontSize: '16px', fontWeight: 700, color: pct >= 100 ? '#1A7A4A' : '#1A2E5C', flexShrink: 0 }}>{pct}%</span>
              </div>
              <div style={{ background: '#F5F3EE', borderRadius: '4px', height: '8px', marginBottom: '8px', overflow: 'hidden' }} aria-label={`${pct}% progress towards ${goal.title}`} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                <div style={{ width: `${pct}%`, height: '100%', background: pct >= 100 ? '#1A7A4A' : '#E67E22', borderRadius: '4px', transition: 'width 0.3s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>
                  {formatINR(goal.current_amount)} of {formatINR(goal.target_amount)}
                  {goal.target_date && ` · by ${new Date(goal.target_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`}
                </span>
                {pct < 100 && (
                  <button onClick={() => setContributeModal(goal.id)} style={{ background: '#FFF6EF', color: '#C0622A', border: '1px solid #E67E22', borderRadius: '6px', padding: '8px 14px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, minHeight: '40px' }}>
                    + Contribute
                  </button>
                )}
              </div>
              {contributeModal === goal.id && (
                <div style={{ marginTop: '12px', padding: '12px', background: '#F5F3EE', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <label htmlFor={`contrib-${goal.id}`} style={{ fontSize: '14px', fontWeight: 500, flexShrink: 0 }}>Amount (₹)</label>
                  <input id={`contrib-${goal.id}`} type="number" value={contribAmount} onChange={e => setContribAmount(e.target.value)} placeholder="0" style={{ ...inputStyle, height: '40px', flex: 1 }} min="1" />
                  <button onClick={handleContribute} disabled={!contribAmount} style={{ height: '40px', padding: '0 16px', background: '#E67E22', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, flexShrink: 0, opacity: !contribAmount ? 0.5 : 1 }}>Add</button>
                  <button onClick={() => { setContributeModal(null); setContribAmount('') }} style={{ height: '40px', padding: '0 14px', background: '#fff', border: '1px solid #E0DDD8', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}

const primaryBtnStyle = { background: '#E67E22', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 20px', height: '48px', fontWeight: 600, cursor: 'pointer', fontSize: '15px' }
const ghostBtnStyle = { background: '#fff', color: '#333', border: '1px solid #E0DDD8', borderRadius: '8px', padding: '0 20px', height: '48px', cursor: 'pointer', fontSize: '15px' }
const formCardStyle = { background: '#fff', border: '1px solid #E0DDD8', borderRadius: '12px', padding: '20px', marginBottom: '20px' }
const labelStyle = { display: 'block', fontSize: '14px', fontWeight: 500, color: '#333', marginBottom: '8px' }
const inputStyle = { width: '100%', height: '52px', border: '1px solid #E0DDD8', borderRadius: '8px', padding: '0 14px', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }
