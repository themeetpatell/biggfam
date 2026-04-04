import { useState } from 'react'
import { useDocuments } from '../hooks/useDocuments.js'
import EmptyState from '../components/EmptyState.jsx'
import SectionSkeleton from '../components/SectionSkeleton.jsx'
import { useFamily } from '../contexts/FamilyContext.jsx'

const DOC_TYPES = [
  { value: 'aadhaar', label: 'Aadhaar', icon: '🪪' },
  { value: 'pan', label: 'PAN', icon: '📄' },
  { value: 'passport', label: 'Passport', icon: '🛂' },
  { value: 'property', label: 'Property', icon: '🏠' },
  { value: 'insurance', label: 'Insurance', icon: '🛡️' },
  { value: 'vehicle', label: 'Vehicle', icon: '🚗' },
  { value: 'will', label: 'Will', icon: '📜' },
  { value: 'medical', label: 'Medical', icon: '🏥' },
  { value: 'emirates_id', label: 'Emirates ID', icon: '🪪' },
  { value: 'uae_visa', label: 'UAE Visa', icon: '✈️' },
  { value: 'labour_card', label: 'Labour Card', icon: '💼' },
  { value: 'tenancy_contract', label: 'Tenancy Contract', icon: '🏢' },
  { value: 'other', label: 'Other', icon: '📁' },
]

function getDaysUntilExpiry(expiry_date) {
  if (!expiry_date) return null
  return Math.ceil((new Date(expiry_date) - new Date()) / (1000 * 60 * 60 * 24))
}

export default function DocumentsSection() {
  const { documents, loading, error, refetch, addDocument, deleteDocument } = useDocuments()
  const { members } = useFamily()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ doc_type: 'aadhaar', title: '', document_url: '', expiry_date: '', owner_id: '' })
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [filterOwner, setFilterOwner] = useState('all')

  async function handleAdd() {
    if (!form.title.trim() || !form.document_url.trim()) return
    setSaving(true)
    try {
      await addDocument({
        doc_type: form.doc_type,
        title: form.title.trim(),
        document_url: form.document_url.trim(),
        expiry_date: form.expiry_date || undefined,
        owner_id: form.owner_id || undefined,
      })
      setForm({ doc_type: 'aadhaar', title: '', document_url: '', expiry_date: '', owner_id: '' })
      setShowForm(false)
    } finally { setSaving(false) }
  }

  if (loading) return <SectionSkeleton rows={4} />
  if (error) return <div style={{ padding: '24px', color: '#CC0000' }}>{error} <button onClick={refetch}>Retry</button></div>

  const filtered = filterOwner === 'all' ? documents : documents.filter(d => d.owner_id === filterOwner)

  return (
    <div className="section-content" style={{ maxWidth: '720px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#1A2E5C', margin: 0 }}>Kagaz</h1>
        <button onClick={() => setShowForm(true)} style={primaryBtnStyle}>+ Document</button>
      </div>

      {members.length > 1 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto' }}>
          <button onClick={() => setFilterOwner('all')} style={filterBtnStyle(filterOwner === 'all')}>All</button>
          {members.map(m => (
            <button key={m.id} onClick={() => setFilterOwner(m.id)} style={filterBtnStyle(filterOwner === m.id)}>{m.name}</button>
          ))}
        </div>
      )}

      {showForm && (
        <div style={formCardStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle} htmlFor="doc-type">Document type *</label>
              <select id="doc-type" value={form.doc_type} onChange={e => setForm(p => ({...p, doc_type: e.target.value}))} style={inputStyle}>
                {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle} htmlFor="doc-owner">For (family member)</label>
              <select id="doc-owner" value={form.owner_id} onChange={e => setForm(p => ({...p, owner_id: e.target.value}))} style={inputStyle}>
                <option value="">Anyone</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle} htmlFor="doc-title">Title *</label>
              <input id="doc-title" type="text" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="e.g. Dad's Passport" style={inputStyle} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle} htmlFor="doc-url">Document link * (Google Drive, Dropbox, etc.)</label>
              <input id="doc-url" type="url" value={form.document_url} onChange={e => setForm(p => ({...p, document_url: e.target.value}))} placeholder="https://drive.google.com/..." style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle} htmlFor="doc-expiry">Expiry date (optional)</label>
              <input id="doc-expiry" type="date" value={form.expiry_date} onChange={e => setForm(p => ({...p, expiry_date: e.target.value}))} style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleAdd} disabled={saving || !form.title.trim() || !form.document_url.trim()} style={{ ...primaryBtnStyle, flex: 1, opacity: saving || !form.title.trim() || !form.document_url.trim() ? 0.5 : 1 }}>
              {saving ? 'Saving…' : 'Add Document'}
            </button>
            <button onClick={() => setShowForm(false)} style={ghostBtnStyle}>Cancel</button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState icon="📁" title="No documents yet" description="Store Aadhaar, PAN, Passport, insurance and all important family papers in one place." cta="Add first document" onAction={() => setShowForm(true)} />
      ) : (
        filtered.map(doc => {
          const days = getDaysUntilExpiry(doc.expiry_date)
          const typeInfo = DOC_TYPES.find(t => t.value === doc.doc_type) || { icon: '📁', label: doc.doc_type }
          const owner = members.find(m => m.id === doc.owner_id)
          return (
            <div key={doc.id} style={{ background: '#fff', border: '1px solid #E0DDD8', borderRadius: '12px', padding: '14px 20px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', flex: 1 }}>
                <span style={{ fontSize: '28px' }}>{typeInfo.icon}</span>
                <div>
                  <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: '15px', color: '#1A1A1A' }}>{doc.title}</p>
                  <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#888' }}>
                    {typeInfo.label}{owner ? ` · ${owner.name}` : ''}
                  </p>
                  {days !== null && (
                    <span style={{
                      fontSize: '12px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px',
                      background: days < 30 ? '#FFF0F0' : days < 90 ? '#FFF6EF' : '#F5F3EE',
                      color: days < 30 ? '#CC0000' : days < 90 ? '#C0622A' : '#666',
                    }}>
                      {days < 0 ? 'Expired' : `Expires in ${days} days`}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'center' }}>
                <a href={doc.document_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '40px', minHeight: '40px', borderRadius: '6px', background: '#F5F3EE', textDecoration: 'none', fontSize: '16px' }} aria-label="Open document">🔗</a>
                {deleteConfirm === doc.id ? (
                  <>
                    <button onClick={() => { deleteDocument(doc.id); setDeleteConfirm(null) }} style={{ height: '36px', padding: '0 12px', background: '#CC0000', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Delete</button>
                    <button onClick={() => setDeleteConfirm(null)} style={{ height: '36px', padding: '0 12px', background: '#fff', border: '1px solid #E0DDD8', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>No</button>
                  </>
                ) : (
                  <button onClick={() => setDeleteConfirm(doc.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', minWidth: '40px', minHeight: '40px', borderRadius: '6px', color: '#CC0000' }} aria-label="Delete">🗑️</button>
                )}
              </div>
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
const filterBtnStyle = (active) => ({ padding: '6px 14px', borderRadius: '20px', border: '1px solid #E0DDD8', background: active ? '#1A2E5C' : '#fff', color: active ? '#fff' : '#333', fontWeight: active ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap', minHeight: '36px', fontSize: '14px' })
