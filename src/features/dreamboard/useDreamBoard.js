import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../shared/lib/supabase'

const STORAGE_KEY = 'life-wheel-dreamboard'

const createEmptyItem = (overrides = {}) => ({
  id: Date.now().toString(),
  title: '',
  image_url: '',
  affirmation: '',
  area_id: '',
  status: 'active',
  sort_order: 0,
  created_at: new Date().toISOString(),
  ...overrides,
})

export default function useDreamBoard() {
  const [items, setItems] = useState([])
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(false)

  // Auth tracking
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Load data
  useEffect(() => {
    if (userId) {
      loadFromSupabase(userId)
    } else {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) setItems(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading dream board from localStorage:', e)
      }
    }
  }, [userId])

  const loadFromSupabase = async (uid) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('dream_boards')
      .select('*')
      .eq('user_id', uid)
      .order('sort_order', { ascending: true })
    setLoading(false)
    if (error) {
      console.error('Error loading dream board:', error.message)
      return
    }
    setItems(data || [])
  }

  const saveLocal = useCallback((newItems) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems))
    } catch (e) {
      console.error(e)
    }
  }, [])

  // Add item
  const addItem = useCallback(async (data) => {
    const newItem = createEmptyItem({ ...data, sort_order: items.length })
    if (userId) {
      const { id: _id, ...payload } = newItem
      const { data: row, error } = await supabase
        .from('dream_boards')
        .insert([{ ...payload, user_id: userId }])
        .select()
        .single()
      if (error) { console.error('Error adding dream:', error.message); return }
      setItems(prev => [...prev, row])
    } else {
      const updated = [...items, newItem]
      setItems(updated)
      saveLocal(updated)
    }
  }, [items, userId, saveLocal])

  // Update item
  const updateItem = useCallback(async (id, data) => {
    const payload = { ...data, updated_at: new Date().toISOString() }
    if (userId) {
      const { error } = await supabase
        .from('dream_boards')
        .update(payload)
        .eq('id', id)
        .eq('user_id', userId)
      if (error) { console.error('Error updating dream:', error.message); return }
    }
    setItems(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, ...payload } : item)
      if (!userId) saveLocal(updated)
      return updated
    })
  }, [userId, saveLocal])

  // Delete item
  const deleteItem = useCallback(async (id) => {
    if (userId) {
      const { error } = await supabase
        .from('dream_boards')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
      if (error) { console.error('Error deleting dream:', error.message); return }
    }
    setItems(prev => {
      const updated = prev.filter(item => item.id !== id)
      if (!userId) saveLocal(updated)
      return updated
    })
  }, [userId, saveLocal])

  // Toggle achieved status
  const toggleAchieved = useCallback((id) => {
    const item = items.find(i => i.id === id)
    if (!item) return
    const newStatus = item.status === 'achieved' ? 'active' : 'achieved'
    updateItem(id, { status: newStatus })
  }, [items, updateItem])

  return {
    items,
    loading,
    addItem,
    updateItem,
    deleteItem,
    toggleAchieved,
  }
}
