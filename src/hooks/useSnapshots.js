import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'life-wheel-snapshots'

export default function useSnapshots() {
  const [snapshots, setSnapshots] = useState([])

  // Load snapshots từ localStorage khi mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setSnapshots(JSON.parse(saved))
      }
    } catch (e) {
      console.error('Error loading snapshots:', e)
    }
  }, [])

  // Lưu vào localStorage khi snapshots thay đổi
  const saveToStorage = useCallback((newSnapshots) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSnapshots))
      setSnapshots(newSnapshots)
    } catch (e) {
      console.error('Error saving snapshots:', e)
    }
  }, [])

  // Thêm snapshot mới
  const addSnapshot = useCallback((scores, period) => {
    const newSnapshot = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      period, // 'week' | 'month' | 'year'
      scores: { ...scores },
    }
    const newSnapshots = [newSnapshot, ...snapshots]
    saveToStorage(newSnapshots)
    return newSnapshot
  }, [snapshots, saveToStorage])

  // Xóa 1 snapshot
  const deleteSnapshot = useCallback((id) => {
    const newSnapshots = snapshots.filter(s => s.id !== id)
    saveToStorage(newSnapshots)
    return newSnapshots
  }, [snapshots, saveToStorage])

  // Xóa tất cả snapshot theo period
  const deleteByPeriod = useCallback((period) => {
    const newSnapshots = snapshots.filter(s => s.period !== period)
    saveToStorage(newSnapshots)
    return newSnapshots
  }, [snapshots, saveToStorage])

  // Lấy snapshot gần nhất
  const getLatestSnapshot = useCallback(() => {
    if (snapshots.length === 0) return null
    return snapshots[0]
  }, [snapshots])

  // Lấy snapshot theo id
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

// Period labels
export const PERIODS = [
  { value: 'month', label: 'Tháng' },
  { value: 'quarter', label: 'Quý' },
  { value: 'year', label: 'Năm' },
]

export function getPeriodLabel(period) {
  return PERIODS.find(p => p.value === period)?.label || period
}
