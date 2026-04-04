import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from '@clerk/react'
import { families as familiesApi } from '../lib/api.js'

const FamilyContext = createContext(null)

export function FamilyProvider({ children }) {
  const { getToken } = useAuth()
  const [family, setFamily] = useState(undefined)  // undefined = loading, null = no family
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function loadFamily() {
    setLoading(true)
    setError(null)
    try {
      const token = await getToken()
      const { families } = await familiesApi.list(token)

      if (!families || families.length === 0) {
        setFamily(null)
        setMembers([])
        setLoading(false)
        return
      }

      const f = families[0]
      setFamily(f)

      const { members: m } = await familiesApi.members(f.id, token)
      setMembers(m ?? [])
    } catch (err) {
      console.error('[FamilyContext]', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadFamily() }, [])

  // Build Maahi context string — summarizes family for the AI
  const maahiContext = family
    ? [
        `Family: ${family.name}`,
        members.length > 0
          ? `Members: ${members.map(m => `${m.name} (${m.relationship || m.role})`).join(', ')}`
          : '',
        family.city ? `Location: ${family.city}` : '',
      ].filter(Boolean).join('. ')
    : ''

  return (
    <FamilyContext.Provider value={{ family, members, loading, error, refetch: loadFamily, maahiContext }}>
      {children}
    </FamilyContext.Provider>
  )
}

export function useFamily() {
  const ctx = useContext(FamilyContext)
  if (!ctx) throw new Error('useFamily must be used inside FamilyProvider')
  return ctx
}
