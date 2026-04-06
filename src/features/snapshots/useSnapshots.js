import { useState, useEffect, useCallback } from 'react'
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

export default function useSnapshots() {
  const [snapshots, setSnapshots] = useState([])
  const [userId, setUserId] = useState(null)

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
  useEffect(() => {
    if (userId) {
      // Đã đăng nhập: tải từ Supabase
      loadFromSupabase(userId)
    } else {
      // Chưa đăng nhập: tải từ localStorage
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
      // Chuẩn hóa dữ liệu từ Supabase sang format dùng ở app
      setSnapshots(data.map(s => ({
        id: s.id,
        date: s.created_at,
        period: s.period,
        scores: s.scores,
      })))
    }
  }

  // Lưu vào localStorage (khi chưa đăng nhập)
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
      // Đã đăng nhập: lưu lên Supabase
      const { data, error } = await supabase
        .from('snapshots')
        .insert([{ user_id: userId, scores, period }])
        .select()
        .single()
      if (error) {
        console.error('Error saving snapshot to Supabase:', error.message)
        return null
      }
      const newSnapshot = { id: data.id, date: data.created_at, period: data.period, scores: data.scores }
      setSnapshots(prev => [newSnapshot, ...prev])
      return newSnapshot
    } else {
      // Chưa đăng nhập: lưu vào localStorage
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

  return {
    snapshots,
    addSnapshot,
    deleteSnapshot,
    deleteByPeriod,
    getLatestSnapshot,
    getSnapshotById,
  }
}
