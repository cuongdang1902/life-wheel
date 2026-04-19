import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../../shared/lib/supabase'

const STORAGE_KEY = 'life-wheel-snapshots'

// Period labels
export const PERIODS = [
  { value: 'month', label: 'Tháng' },
  { value: 'quarter', label: 'Quý' },
  { value: 'year', label: 'Năm' },
]

export function getPeriodLabel(period) {
  return PERIODS.find(p => p.value === period)?.label || period
}

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

// Helper: extract YYYY-MM from ISO date string without timezone issues
// Works by parsing the ISO string directly: "2026-01-15T12:00:00.000Z" → "2026-01"
function isoToMonthKey(isoString) {
  if (!isoString) return null
  // ISO string always starts with YYYY-MM-DD
  const match = isoString.match(/^(\d{4})-(\d{2})/)
  if (match) return `${match[1]}-${match[2]}`
  // Fallback: parse as Date using local time
  const d = new Date(isoString)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function useSnapshots() {
  const [snapshots, setSnapshots] = useState([])
  const [userId, setUserId] = useState(null)
  const upsertingRef = useRef(new Set()) // track in-flight upserts per monthKey to prevent duplicates

  // Theo dõi trạng thái đăng nhập
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null)
    }).catch(() => setUserId(null))
    let subscription
    try {
      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUserId(session?.user?.id ?? null)
      })
      subscription = sub
    } catch (_) {
      subscription = { unsubscribe: () => {} }
    }
    return () => subscription?.unsubscribe?.()
  }, [])

  // Load snapshots theo trạng thái đăng nhập
  // Clear trước khi load để đảm bảo cycle empty→populated luôn xảy ra
  // (giúp HomePage detect re-login và reload điểm đúng)
  useEffect(() => {

    setSnapshots([])
    if (userId) {
      loadFromSupabase(userId)
    } else {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) setSnapshots(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading snapshots from localStorage:', e)
      }
    }
  }, [userId])

  const loadFromSupabase = async (uid) => {
    const { data, error } = await supabase
      .from('snapshots')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
    if (error) {
      console.error('Error loading snapshots from Supabase:', error.message)
    } else {
      const mapped = data.map(s => ({
        id: s.id,
        date: s.created_at,
        period: s.period,
        scores: s.scores,
        monthKey: s.period === 'month' ? isoToMonthKey(s.created_at) : null,
      }))

      setSnapshots(mapped)
    }
  }

  const saveToLocalStorage = useCallback((newSnapshots) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSnapshots))
      setSnapshots(newSnapshots)
    } catch (e) {
      console.error('Error saving snapshots to localStorage:', e)
    }
  }, [])

  const addSnapshot = useCallback(async (scores, period) => {
    if (userId) {
      const { data, error } = await supabase
        .from('snapshots')
        .insert([{ user_id: userId, scores, period }])
        .select()
      if (error) {
        console.error('Error saving snapshot to Supabase:', error.message)
        return null
      }
      const row = data?.[0]
      if (!row) return null
      const newSnapshot = { id: row.id, date: row.created_at, period: row.period, scores: row.scores }
      setSnapshots(prev => [newSnapshot, ...prev])
      return newSnapshot
    } else {
      const newSnapshot = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        period,
        scores: { ...scores },
      }
      const updated = [newSnapshot, ...snapshots]
      saveToLocalStorage(updated)
      return newSnapshot
    }
  }, [userId, snapshots, saveToLocalStorage])

  const deleteSnapshot = useCallback(async (id) => {
    if (userId) {
      const { error } = await supabase.from('snapshots').delete().eq('id', id).eq('user_id', userId)
      if (error) { console.error('Error deleting snapshot:', error.message); return }
      setSnapshots(prev => prev.filter(s => s.id !== id))
    } else {
      const updated = snapshots.filter(s => s.id !== id)
      saveToLocalStorage(updated)
    }
  }, [userId, snapshots, saveToLocalStorage])

  const deleteByPeriod = useCallback(async (period) => {
    if (userId) {
      const { error } = await supabase.from('snapshots').delete().eq('period', period).eq('user_id', userId)
      if (error) { console.error('Error deleting snapshots by period:', error.message); return }
      setSnapshots(prev => prev.filter(s => s.period !== period))
    } else {
      const updated = snapshots.filter(s => s.period !== period)
      saveToLocalStorage(updated)
    }
  }, [userId, snapshots, saveToLocalStorage])

  const getLatestSnapshot = useCallback(() => {
    return snapshots.length > 0 ? snapshots[0] : null
  }, [snapshots])

  const getSnapshotById = useCallback((id) => {
    return snapshots.find(s => s.id === id) || null
  }, [snapshots])

  // ========== MONTHLY SCORING ==========

  // Find snapshot by explicit monthKey (e.g. "2026-01") - no date parsing!
  const getSnapshotByMonth = useCallback((mk) => {
    const matches = snapshots.filter(s => {
      if (s.monthKey === mk && s.period === 'month') return true
      // Legacy fallback: parse date for old snapshots without monthKey
      if (s.period === 'month' && !s.monthKey && isoToMonthKey(s.date) === mk) return true
      return false
    })
    if (!matches.length) return null
    return matches.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
  }, [snapshots])

  // Upsert: update if exists for this monthKey, otherwise insert
  // Queries Supabase directly to avoid stale-closure duplicate-insert bug
  const upsertMonthlySnapshot = useCallback(async (scores, year, month) => {
    const mk = `${year}-${String(month).padStart(2, '0')}`
    const targetDate = `${year}-${String(month).padStart(2, '0')}-15T12:00:00.000Z`

    if (userId) {
      // Lock: nếu đang upsert tháng này rồi thì bỏ qua (debounce xử lý call cuối)
      if (upsertingRef.current.has(mk)) return null
      upsertingRef.current.add(mk)

      try {
        // Query DB trực tiếp — không dùng local state để tránh race condition
        const startOfMonth = `${year}-${String(month).padStart(2, '0')}-01T00:00:00.000Z`
        const nextYear = month === 12 ? year + 1 : year
        const nextMonth = month === 12 ? 1 : month + 1
        const startOfNextMonth = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01T00:00:00.000Z`

        const { data: rows, error: findError } = await supabase
          .from('snapshots')
          .select('id, created_at, period, scores')
          .eq('user_id', userId)
          .eq('period', 'month')
          .gte('created_at', startOfMonth)
          .lt('created_at', startOfNextMonth)
          .order('created_at', { ascending: false })
          .limit(1)

        if (findError) {
          console.error('Error finding monthly snapshot:', findError.message)
          return null
        }

        const existingRow = rows?.[0]

        if (existingRow) {
          // UPDATE
          const { error } = await supabase
            .from('snapshots')
            .update({ scores })
            .eq('id', existingRow.id)
            .eq('user_id', userId)
          if (error) { console.error('Error updating monthly snapshot:', error.message); return null }
          const updated = { id: existingRow.id, date: existingRow.created_at, period: 'month', scores: { ...scores }, monthKey: mk }
          setSnapshots(prev => prev.map(s => s.id === existingRow.id ? updated : s))
          return updated
        } else {
          // INSERT
          const { data, error } = await supabase
            .from('snapshots')
            .insert([{ user_id: userId, scores, period: 'month', created_at: targetDate }])
            .select()
          if (error) { console.error('Error inserting monthly snapshot:', error.message); return null }
          const row = data?.[0]
          if (!row) { console.error('Error: insert returned no data'); return null }
          const newSnapshot = { id: row.id, date: row.created_at, period: row.period, scores: row.scores, monthKey: mk }
          setSnapshots(prev => [newSnapshot, ...prev])
          return newSnapshot
        }
      } finally {
        upsertingRef.current.delete(mk)
      }
    } else {
      // Offline: dùng local state (không có race condition vì là synchronous)
      const existing = snapshots.find(s => {
        if (s.monthKey === mk && s.period === 'month') return true
        if (s.period === 'month' && !s.monthKey && isoToMonthKey(s.date) === mk) return true
        return false
      })
      if (existing) {
        const updated = { ...existing, scores: { ...scores }, monthKey: mk }
        const newList = snapshots.map(s => s.id === existing.id ? updated : s)
        saveToLocalStorage(newList)
        return updated
      } else {
        const newSnapshot = {
          id: Date.now().toString(),
          date: targetDate,
          period: 'month',
          scores: { ...scores },
          monthKey: mk,
        }
        const updated = [newSnapshot, ...snapshots]
        saveToLocalStorage(updated)
        return newSnapshot
      }
    }
  }, [userId, snapshots, saveToLocalStorage])

  return {
    snapshots,
    addSnapshot,
    deleteSnapshot,
    deleteByPeriod,
    getLatestSnapshot,
    getSnapshotById,
    getSnapshotByMonth,
    upsertMonthlySnapshot,
  }
}
