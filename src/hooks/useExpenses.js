import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/react'
import { useFamily } from '../contexts/FamilyContext.jsx'
import { expenses as expensesApi } from '../lib/api.js'

export function useExpenses(month, year) {
  const { family } = useFamily()
  const { getToken } = useAuth()
  const [expenseList, setExpenseList] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchExpenses() {
    if (!family?.id) return
    setLoading(true)
    setError(null)
    try {
      const token = await getToken()
      const res = await expensesApi.list(family.id, month, year, token)
      setExpenseList(res.expenses ?? [])
      setTotal(res.total ?? 0)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchExpenses() }, [family?.id, month, year])

  async function addExpense(data) {
    const token = await getToken()
    const { expense } = await expensesApi.create({ ...data, family_id: family.id }, token)
    setExpenseList(prev => [expense, ...prev])
    setTotal(prev => Number(prev) + Number(data.amount))
    return expense
  }

  return { expenses: expenseList, total, loading, error, refetch: fetchExpenses, addExpense }
}

export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}
