import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/react'
import { useFamily } from '../contexts/FamilyContext.jsx'
import { events as eventsApi } from '../lib/api.js'

export function useEvents(from, to) {
  const { family } = useFamily()
  const { getToken } = useAuth()
  const [eventList, setEventList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchEvents() {
    if (!family?.id) return
    setLoading(true)
    setError(null)
    try {
      const token = await getToken()
      const { events } = await eventsApi.list(family.id, from, to, token)
      setEventList(events ?? [])
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchEvents() }, [family?.id, from, to])

  async function createEvent(data) {
    const token = await getToken()
    const { event } = await eventsApi.create({ ...data, family_id: family.id }, token)
    setEventList(prev => [...prev, event].sort((a, b) => new Date(a.start_time) - new Date(b.start_time)))
    return event
  }

  async function deleteEvent(id) {
    const token = await getToken()
    await eventsApi.delete(id, token)
    setEventList(prev => prev.filter(e => e.id !== id))
  }

  return { events: eventList, loading, error, refetch: fetchEvents, createEvent, deleteEvent }
}
