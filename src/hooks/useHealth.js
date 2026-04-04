import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/react'
import { useFamily } from '../contexts/FamilyContext.jsx'
import { health as healthApi } from '../lib/api.js'

export function useHealth(memberId) {
  const { family } = useFamily()
  const { getToken } = useAuth()
  const [records, setRecords] = useState([])
  const [medications, setMedications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchHealth() {
    if (!family?.id) return
    setLoading(true)
    setError(null)
    try {
      const token = await getToken()
      const res = await healthApi.list(family.id, memberId, token)
      setRecords(res.records ?? [])
      setMedications(res.medications ?? [])
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchHealth() }, [family?.id, memberId])

  async function addRecord(data) {
    const token = await getToken()
    const { record } = await healthApi.addRecord({ ...data, family_id: family.id }, token)
    setRecords(prev => [record, ...prev])
    return record
  }

  async function addMedication(data) {
    const token = await getToken()
    const { medication } = await healthApi.addMedication({ ...data, family_id: family.id }, token)
    setMedications(prev => [medication, ...prev])
    return medication
  }

  return { records, medications, loading, error, refetch: fetchHealth, addRecord, addMedication }
}
