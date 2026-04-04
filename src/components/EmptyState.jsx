export default function EmptyState({ icon, title, description, cta, onAction }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>{icon}</div>
      <h3 style={{
        fontSize: '20px', fontWeight: 700, marginBottom: '8px',
        color: '#1A2E5C', margin: '0 0 8px'
      }}>
        {title}
      </h3>
      {description && (
        <p style={{ fontSize: '15px', color: '#666', margin: '0 0 24px', lineHeight: 1.5 }}>
          {description}
        </p>
      )}
      {cta && (
        <button
          onClick={onAction}
          style={{
            background: '#E67E22', color: '#fff', border: 'none',
            borderRadius: '8px', padding: '14px 24px', fontSize: '15px',
            fontWeight: 600, cursor: 'pointer', minHeight: '48px'
          }}
        >
          {cta}
        </button>
      )}
    </div>
  )
}
