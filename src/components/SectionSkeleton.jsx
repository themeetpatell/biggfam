export default function SectionSkeleton({ rows = 3 }) {
  return (
    <div style={{ padding: '16px' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            height: '72px',
            background: '#F5F3EE',
            borderRadius: '12px',
            marginBottom: '12px',
            animation: 'pulse 1.5s ease-in-out infinite',
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  )
}
