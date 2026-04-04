import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/react'
import { useFamily } from '../contexts/FamilyContext.jsx'
import { goals as goalsApi } from '../lib/api.js'

export function useGoals() {
  const { family } = useFamily()
  const { getToken } = useAuth()
  const [goalList, setGoalList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchGoals() {
    if (!family?.id) return
    setLoading(true)
    setError(null)
    try {
      const token = await getToken()
      const { goals } = await goalsApi.list(family.id, token)
      setGoalList(goals ?? [])
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchGoals() }, [family?.id])

  async function createGoal(data) {
    const token = await getToken()
    const { goal } = await goalsApi.create({ ...data, family_id: family.id }, token)
    setGoalList(prev => [goal, ...prev])
    return goal
  }

  async function contribute(goal_id, amount, note) {
    const token = await getToken()
    await goalsApi.contribute({ goal_id, amount, note }, token)
    await fetchGoals() // refetch to get updated amounts
  }

  return { goals: goalList, loading, error, refetch: fetchGoals, createGoal, contribute }
}
