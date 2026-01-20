import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

// Period labels
export const PERIODS = [
  { value: 'month', label: 'Tháng' },
  { value: 'quarter', label: 'Quý' },
  { value: 'year', label: 'Năm' },
]

// Helper: Generate period_key from date
function getPeriodKey(period, date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const week = getWeekNumber(date)
  
  switch (period) {
    case 'week':
      return `${year}-W${String(week).padStart(2, '0')}`
    case 'month':
      return `${year}-${month}`
    case 'quarter':
      const quarter = Math.ceil((date.getMonth() + 1) / 3)
      return `${year}-Q${quarter}`
    case 'year':
      return `${year}`
    default:
      return `${year}-${month}`
  }
}

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}

// Helper format date
export function formatDate(isoString) {
  const date = new Date(isoString)
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getPeriodLabel(period) {
  return PERIODS.find(p => p.value === period)?.label || period
}

export default function useSnapshots() {
  const { user } = useAuth()
  const [snapshots, setSnapshots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch snapshots from Supabase
  const fetchSnapshots = useCallback(async () => {
    if (!user) {
      setSnapshots([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('life_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      // Transform to app format
      const transformed = data.map(entry => ({
        id: entry.id,
        date: entry.created_at,
        period: entry.period_type,
        periodKey: entry.period_key,
        scores: entry.scores,
        note: entry.overall_note,
      }))

      setSnapshots(transformed)
    } catch (err) {
      console.error('Error fetching snapshots:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Load snapshots on mount and when user changes
  useEffect(() => {
    fetchSnapshots()
  }, [fetchSnapshots])

  // Add snapshot
  const addSnapshot = useCallback(async (scores, period, note = null) => {
    if (!user) return null

    try {
      setError(null)
      const periodKey = getPeriodKey(period)
      
      const { data, error: insertError } = await supabase
        .from('life_entries')
        .insert({
          user_id: user.id,
          period_type: period,
          period_key: periodKey,
          scores,
          overall_note: note,
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Add to local state
      const newSnapshot = {
        id: data.id,
        date: data.created_at,
        period: data.period_type,
        periodKey: data.period_key,
        scores: data.scores,
        note: data.overall_note,
      }
      
      setSnapshots(prev => [newSnapshot, ...prev])
      return newSnapshot
    } catch (err) {
      console.error('Error adding snapshot:', err)
      setError(err.message)
      return null
    }
  }, [user])

  // Delete snapshot
  const deleteSnapshot = useCallback(async (id) => {
    if (!user) return false

    try {
      setError(null)
      
      const { error: deleteError } = await supabase
        .from('life_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) throw deleteError

      setSnapshots(prev => prev.filter(s => s.id !== id))
      return true
    } catch (err) {
      console.error('Error deleting snapshot:', err)
      setError(err.message)
      return false
    }
  }, [user])

  // Delete all snapshots by period
  const deleteByPeriod = useCallback(async (period) => {
    if (!user) return false

    try {
      setError(null)
      
      const { error: deleteError } = await supabase
        .from('life_entries')
        .delete()
        .eq('period_type', period)
        .eq('user_id', user.id)

      if (deleteError) throw deleteError

      setSnapshots(prev => prev.filter(s => s.period !== period))
      return true
    } catch (err) {
      console.error('Error deleting snapshots by period:', err)
      setError(err.message)
      return false
    }
  }, [user])

  // Get latest snapshot
  const getLatestSnapshot = useCallback(() => {
    if (snapshots.length === 0) return null
    return snapshots[0]
  }, [snapshots])

  // Get snapshot by id
  const getSnapshotById = useCallback((id) => {
    return snapshots.find(s => s.id === id) || null
  }, [snapshots])

  return {
    snapshots,
    loading,
    error,
    addSnapshot,
    deleteSnapshot,
    deleteByPeriod,
    getLatestSnapshot,
    getSnapshotById,
    refetch: fetchSnapshots,
  }
}
