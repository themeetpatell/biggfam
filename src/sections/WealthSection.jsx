import { useState } from 'react'
import { useExpenses, formatINR } from '../hooks/useExpenses.js'
import EmptyState from '../components/EmptyState.jsx'
import SectionSkeleton from '../components/SectionSkeleton.jsx'

const CATEGORIES = ['Grocery', 'Medical', 'School', 'Utilities', 'EMI', 'Festival', 'Travel', 'Rent', 'Other']
const PAYMENT_MODES = ['UPI', 'Cash', 'Card', 'Net Banking', 'Cheque']

export default function WealthSection() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const { expenses, total, loading, error, refetch, addExpense } = useExpenses(month, year)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', amount: '', category: 'Other', payment_mode: 'UPI', expense_date: new Date().toISOString().slice(0, 10) })
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    if (!form.title.trim() || !form.amount) return
    setSaving(true)
    try {
      await addExpense({ ...form, amount: Number(form.amount) })
      setForm({ title: '', amount: '', category: 'Other', payment_mode: 'UPI', expense_date: new Date().toISOString().slice(0, 10) })
      setShowForm(false)
    } finally { setSaving(false) }
  }

  if (loading) return <SectionSkeleton rows={5} />
  if (error) return <div style={{ padding: '24px', color: '#CC0000' }}>{error} <button onClick={refetch}>Retry</button></div>

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  return (
    <div className="section-content" style={{ maxWidth: '720px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#1A2E5C', margin: 0 }}>Ghar Ka Hisaab</h1>
        <button onClick={() => setShowForm(true)} style={primaryBtnStyle}>+ Expense</button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
        {MONTHS.map((m, i) => (
          <button
            key={m}
            onClick={() => setMonth(i + 1)}
            style={{
              padding: '6px 14px', borderRadius: '20px', border: '1px solid #E0DDD8',
              background: month === i + 1 ? '#E67E22' : '#fff',
              color: month === i + 1 ? '#fff' : '#333',
              fontWeight: month === i + 1 ? 600 : 400,
              cursor: 'pointer', whiteSpace: 'nowrap', minHeight: '36px', fontSize: '14px',
            }}
          >
            {m}
          </button>
        ))}
      </div>

      <div style={{ background: '#1A2E5C', borderRadius: '12px', padding: '20px 24px', marginBottom: '20px', color: '#fff' }}>
        <p style={{ margin: '0 0 4px', fontSize: '14px', opacity: 0.7 }}>Total spent — {MONTHS[month - 1]} {year}</p>
        <p style={{ margin: 0, fontSize: '28px', fontWeight: 700 }}>{formatINR(total)}</p>
      </div>

      {showForm && (
        <div style={formCardStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle} htmlFor="exp-title">What was it for? *</label>
              <input id="exp-title" type="text" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="e.g. Monthly groceries" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle} htmlFor="exp-amount">Amount (₹) *</label>
              <input id="exp-amount" type="number" value={form.amount} onChange={e => setForm(p => ({...p, amount: e.target.value}))} placeholder="0" style={inputStyle} min="0" />
            </div>
            <div>
              <label style={labelStyle} htmlFor="exp-date">Date *</label>
              <input id="exp-date" type="date" value={form.expense_date} onChange={e => setForm(p => ({...p, expense_date: e.target.value}))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle} htmlFor="exp-cat">Category</label>
              <select id="exp-cat" value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))} style={inputStyle}>
                {CATEGORIES.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle} htmlFor="exp-mode">Payment mode</label>
              <select id="exp-mode" value={form.payment_mode} onChange={e => setForm(p => ({...p, payment_mode: e.target.value}))} style={inputStyle}>
                {PAYMENT_MODES.map(m => <option key={m} value={m.toLowerCase()}>{m}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleAdd} disabled={saving || !form.title.trim() || !form.amount} style={{ ...primaryBtnStyle, flex: 1, opacity: saving || !form.title.trim() || !form.amount ? 0.5 : 1 }}>
              {saving ? 'Saving…' : 'Add Expense'}
            </button>
            <button onClick={() => setShowForm(false)} style={ghostBtnStyle}>Cancel</button>
          </div>
        </div>
      )}

      {expenses.length === 0 ? (
        <EmptyState icon="💸" title="No expenses this month" description="Track your family's spending to see where the money goes." cta="Add first expense" onAction={() => setShowForm(true)} />
      ) : (
        expenses.map(exp => (
          <div key={exp.id} style={{ background: '#fff', border: '1px solid #E0DDD8', borderRadius: '12px', padding: '14px 20px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: '15px', color: '#1A1A1A' }}>{exp.title}</p>
              <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>
                {exp.category} · {exp.payment_mode?.toUpperCase()} · {exp.paid_by_name || 'You'} · {new Date(exp.expense_date).toLocaleDateString('en-IN')}
              </p>
            </div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '16px', color: '#1A2E5C' }}>{formatINR(exp.amount)}</p>
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
