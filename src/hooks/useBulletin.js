import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/react'
import { useFamily } from '../contexts/FamilyContext.jsx'
import { bulletin as bulletinApi } from '../lib/api.js'

export function useBulletin() {
  const { family } = useFamily()
  const { getToken } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchPosts() {
    if (!family?.id) return
    setLoading(true)
    setError(null)
    try {
      const token = await getToken()
      const { posts: p } = await bulletinApi.list(family.id, token)
      setPosts(p ?? [])
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchPosts() }, [family?.id])

  async function createPost(data) {
    const token = await getToken()
    const { post } = await bulletinApi.create({ ...data, family_id: family.id }, token)
    setPosts(prev => [post, ...prev])
    return post
  }

  async function deletePost(id) {
    const token = await getToken()
    await bulletinApi.delete(id, token)
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  async function pinPost(id, pinned) {
    const token = await getToken()
    const { post } = await bulletinApi.patch(id, { pinned }, token)
    setPosts(prev => prev.map(p => p.id === id ? post : p))
  }

  async function completePost(id, completed) {
    const token = await getToken()
    const { post } = await bulletinApi.patch(id, { completed }, token)
    setPosts(prev => prev.map(p => p.id === id ? post : p))
  }

  return { posts, loading, error, refetch: fetchPosts, createPost, deletePost, pinPost, completePost }
}
