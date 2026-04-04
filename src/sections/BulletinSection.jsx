import { useState } from 'react'
import { useBulletin } from '../hooks/useBulletin.js'
import EmptyState from '../components/EmptyState.jsx'
import SectionSkeleton from '../components/SectionSkeleton.jsx'

const POST_TYPES = ['announcement', 'task', 'grocery', 'reminder']

export default function BulletinSection() {
  const { posts, loading, error, refetch, createPost, deletePost, pinPost, completePost } = useBulletin()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [postType, setPostType] = useState('announcement')
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  async function handleCreate() {
    if (!title.trim()) return
    setSaving(true)
    try {
      await createPost({ title: title.trim(), body: body.trim() || undefined, post_type: postType })
      setTitle(''); setBody(''); setPostType('announcement')
      setShowForm(false)
    } finally { setSaving(false) }
  }

  async function handleDelete(id) {
    await deletePost(id)
    setDeleteConfirm(null)
  }

  if (loading) return <SectionSkeleton rows={4} />
  if (error) return (
    <div style={{ padding: '24px', textAlign: 'center', color: '#CC0000' }}>
      <p>{error}</p>
      <button onClick={refetch} style={{ marginTop: '12px', padding: '10px 20px', cursor: 'pointer', border: '1px solid #E0DDD8', borderRadius: '8px' }}>Retry</button>
    </div>
  )

  return (
    <div className="section-content" style={{ maxWidth: '720px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#1A2E5C', margin: 0 }}>Bulletin</h1>
        <button
          onClick={() => setShowForm(true)}
          style={{ background: '#E67E22', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 20px', height: '48px', fontWeight: 600, cursor: 'pointer' }}
        >
          + Post
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #E0DDD8', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle} htmlFor="post-type">Post type</label>
            <select
              id="post-type"
              value={postType}
              onChange={e => setPostType(e.target.value)}
              style={inputStyle}
            >
              {POST_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle} htmlFor="post-title">Title *</label>
            <input
              id="post-title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What's the update?"
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle} htmlFor="post-body">Details (optional)</label>
            <textarea
              id="post-body"
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Add more context…"
              rows={3}
              style={{ ...inputStyle, height: 'auto', padding: '12px 14px', resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleCreate}
              disabled={saving || !title.trim()}
              style={{ flex: 1, height: '48px', background: '#E67E22', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', opacity: saving || !title.trim() ? 0.5 : 1 }}
            >
              {saving ? 'Posting…' : 'Post'}
            </button>
            <button
              onClick={() => { setShowForm(false); setTitle(''); setBody('') }}
              style={{ height: '48px', padding: '0 20px', background: '#fff', border: '1px solid #E0DDD8', borderRadius: '8px', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {posts.length === 0 ? (
        <EmptyState icon="📌" title="Nothing posted yet" description="Share an update, reminder, or task with your family." cta="Add first post" onAction={() => setShowForm(true)} />
      ) : (
        posts.map(post => (
          <div key={post.id} style={{ background: '#fff', border: `1px solid ${post.pinned ? '#E67E22' : '#E0DDD8'}`, borderRadius: '12px', padding: '16px 20px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#C0622A', background: '#FFF6EF', borderRadius: '4px', padding: '2px 8px' }}>
                    {post.post_type}
                  </span>
                  {post.pinned && <span style={{ fontSize: '11px', color: '#888' }}>📌 Pinned</span>}
                </div>
                <p style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A1A', margin: '0 0 4px' }}>{post.title}</p>
                {post.body && <p style={{ fontSize: '14px', color: '#555', margin: 0, lineHeight: 1.5 }}>{post.body}</p>}
                <p style={{ fontSize: '13px', color: '#888', margin: '8px 0 0' }}>by {post.author_name || 'Family member'}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button
                  onClick={() => pinPost(post.id, !post.pinned)}
                  style={iconBtnStyle}
                  aria-label={post.pinned ? 'Unpin' : 'Pin'}
                  title={post.pinned ? 'Unpin' : 'Pin'}
                >
                  📌
                </button>
                <button
                  onClick={() => setDeleteConfirm(post.id)}
                  style={{ ...iconBtnStyle, color: '#CC0000' }}
                  aria-label="Delete post"
                >
                  🗑️
                </button>
              </div>
            </div>

            {deleteConfirm === post.id && (
              <div style={{ marginTop: '12px', padding: '12px', background: '#FFF0F0', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ flex: 1, fontSize: '14px', color: '#333' }}>Delete this post?</span>
                <button onClick={() => handleDelete(post.id)} style={{ height: '40px', padding: '0 16px', background: '#CC0000', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>Delete</button>
                <button onClick={() => setDeleteConfirm(null)} style={{ height: '40px', padding: '0 16px', background: '#fff', border: '1px solid #E0DDD8', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: '14px', fontWeight: 500, color: '#333', marginBottom: '8px' }
const inputStyle = { width: '100%', height: '52px', border: '1px solid #E0DDD8', borderRadius: '8px', padding: '0 14px', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }
const iconBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '8px', minHeight: '40px', minWidth: '40px', borderRadius: '6px' }
