import EmptyState from '../components/EmptyState.jsx'
export default function MemorySection() {
  return (
    <div style={{ maxWidth: '720px' }}>
      <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#1A2E5C', margin: '0 0 24px' }}>Yaadein</h1>
      <EmptyState icon="📸" title="No memories yet" description="Capture your family's precious moments — photos, stories, and milestones." />
    </div>
  )
}
