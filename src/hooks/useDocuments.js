import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/react'
import { useFamily } from '../contexts/FamilyContext.jsx'
import { documents as documentsApi } from '../lib/api.js'

export function useDocuments() {
  const { family } = useFamily()
  const { getToken } = useAuth()
  const [docList, setDocList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchDocs() {
    if (!family?.id) return
    setLoading(true)
    setError(null)
    try {
      const token = await getToken()
      const { documents } = await documentsApi.list(family.id, token)
      // Sort by expiry date ascending (soonest expiring first, null last)
      const sorted = (documents ?? []).sort((a, b) => {
        if (!a.expiry_date) return 1
        if (!b.expiry_date) return -1
        return new Date(a.expiry_date) - new Date(b.expiry_date)
      })
      setDocList(sorted)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchDocs() }, [family?.id])

  async function addDocument(data) {
    const token = await getToken()
    const { document } = await documentsApi.create({ ...data, family_id: family.id }, token)
    setDocList(prev => [...prev, document])
    return document
  }

  async function deleteDocument(id) {
    const token = await getToken()
    await documentsApi.delete(id, token)
    setDocList(prev => prev.filter(d => d.id !== id))
  }

  return { documents: docList, loading, error, refetch: fetchDocs, addDocument, deleteDocument }
}
