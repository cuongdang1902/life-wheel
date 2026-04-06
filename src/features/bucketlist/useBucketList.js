import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../shared/lib/supabase'

const STORAGE_KEY = 'life-wheel-bucketlist'
const DEFAULT_COUNT = 1

/**
 * Generate an array of empty bucket items for a given year.
 */
const createEmptyItems = (year, count = DEFAULT_COUNT) =>
  Array.from({ length: count }, (_, i) => ({
    id: `local-${year}-${i}-${Date.now()}`,
    year,
    title: '',
    description: '',
    area_id: '',
    status: 'pending',
    sort_order: i,
    completed_at: null,
    created_at: new Date().toISOString(),
  }))

export default function useBucketList() {
  const [itemsByYear, setItemsByYear] = useState({}) // { [year]: BucketItem[] }
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
        if (saved) setItemsByYear(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading bucket list from localStorage:', e)
      }
    }
  }, [userId])

  const loadFromSupabase = async (uid) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('bucket_list')
      .select('*')
      .eq('user_id', uid)
      .order('sort_order', { ascending: true })
    setLoading(false)
    if (error) { console.error('Error loading bucket list:', error.message); return }
    // Group by year
    const grouped = {}
    ;(data || []).forEach(item => {
      if (!grouped[item.year]) grouped[item.year] = []
      grouped[item.year].push(item)
    })
    setItemsByYear(grouped)
  }

  const saveLocal = useCallback((newByYear) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(newByYear)) }
    catch (e) { console.error(e) }
  }, [])

  /**
   * Get items for a year. If none exist, seed with DEFAULT_COUNT empty items.
   */
  const getItemsForYear = useCallback((year) => {
    if (itemsByYear[year] && itemsByYear[year].length > 0) return itemsByYear[year]
    return createEmptyItems(year)
  }, [itemsByYear])

  /**
   * Ensure a year slot exists in state (creates defaults if needed).
   */
  const ensureYear = useCallback((year) => {
    if (!itemsByYear[year] || itemsByYear[year].length === 0) {
      const defaults = createEmptyItems(year)
      setItemsByYear(prev => {
        const next = { ...prev, [year]: defaults }
        if (!userId) saveLocal(next)
        return next
      })
    }
  }, [itemsByYear, userId, saveLocal])

  const _setYear = useCallback((year, newItems) => {
    setItemsByYear(prev => {
      const next = { ...prev, [year]: newItems }
      if (!userId) saveLocal(next)
      return next
    })
  }, [userId, saveLocal])

  // Update a single item's fields
  const updateItem = useCallback(async (year, id, data) => {
    const payload = { ...data, updated_at: new Date().toISOString() }
    const isLocal = String(id).startsWith('local-')
    if (userId && !isLocal) {
      const { error } = await supabase.from('bucket_list').update(payload).eq('id', id).eq('user_id', userId)
      if (error) { console.error('Error updating bucket item:', error.message); return }
    } else if (userId && isLocal && data.title?.trim()) {
      // Promote local item to Supabase when user fills in a title
      const current = (itemsByYear[year] || []).find(i => i.id === id)
      if (!current) return
      const { id: _id, ...rest } = { ...current, ...data, user_id: userId }
      const { data: row, error } = await supabase.from('bucket_list').insert([rest]).select().single()
      if (error) { console.error('Error inserting bucket item:', error.message); return }
      setItemsByYear(prev => {
        const next = { ...prev, [year]: prev[year].map(i => i.id === id ? row : i) }
        return next
      })
      return
    }
    setItemsByYear(prev => {
      const yearItems = (prev[year] || []).map(i => i.id === id ? { ...i, ...payload } : i)
      const next = { ...prev, [year]: yearItems }
      if (!userId) saveLocal(next)
      return next
    })
  }, [itemsByYear, userId, saveLocal])

  // Add a new item to a year
  const addItem = useCallback(async (year) => {
    const existingItems = itemsByYear[year] || []
    const newItem = {
      id: `local-${year}-${Date.now()}`,
      year,
      title: '',
      description: '',
      area_id: '',
      status: 'pending',
      sort_order: existingItems.length,
      completed_at: null,
      created_at: new Date().toISOString(),
    }
    _setYear(year, [...existingItems, newItem])
  }, [itemsByYear, _setYear])

  // Remove an item from a year
  const deleteItem = useCallback(async (year, id) => {
    const isLocal = String(id).startsWith('local-')
    if (userId && !isLocal) {
      const { error } = await supabase.from('bucket_list').delete().eq('id', id).eq('user_id', userId)
      if (error) { console.error('Error deleting bucket item:', error.message); return }
    }
    const yearItems = (itemsByYear[year] || []).filter(i => i.id !== id)
    _setYear(year, yearItems)
  }, [itemsByYear, userId, _setYear])

  // Toggle completed
  const toggleCompleted = useCallback((year, id) => {
    const item = (itemsByYear[year] || []).find(i => i.id === id)
    if (!item) return
    const nowCompleted = item.status !== 'completed'
    updateItem(year, id, {
      status: nowCompleted ? 'completed' : 'pending',
      completed_at: nowCompleted ? new Date().toISOString() : null,
    })
  }, [itemsByYear, updateItem])

  return {
    itemsByYear,
    loading,
    getItemsForYear,
    ensureYear,
    addItem,
    updateItem,
    deleteItem,
    toggleCompleted,
  }
}
