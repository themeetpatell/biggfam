import { useHealth } from '../hooks/useHealth.js'
import SectionSkeleton from '../components/SectionSkeleton.jsx'
import EmptyState from '../components/EmptyState.jsx'

export default function CareSection() {
  const { records, medications, loading, error, refetch } = useHealth()
  if (loading) return <SectionSkeleton rows={4} />
  if (error) return <div style={{ padding: '24px', color: '#CC0000' }}>{error} <button onClick={refetch}>Retry</button></div>
  const hasContent = records.length > 0 || medications.length > 0
  if (!hasContent) return (
    <div>
      <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#1A2E5C', margin: '0 0 24px' }}>Sehat</h1>
      <EmptyState icon="🏥" title="No health records yet" description="Track prescriptions, reports, vaccinations, and medications for your whole family." />
    </div>
  )
  return (
    <div style={{ maxWidth: '720px' }}>
      <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#1A2E5C', margin: '0 0 24px' }}>Sehat</h1>
      <p style={{ color: '#666' }}>{records.length} health records · {medications.filter(m => m.active).length} active medications</p>
    </div>
  )
}
