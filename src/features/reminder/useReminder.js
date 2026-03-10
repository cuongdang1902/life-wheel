import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY_ENABLED = 'life-wheel-reminder-enabled'
const STORAGE_KEY_LAST_MONTH = 'life-wheel-reminder-last-month'
const STORAGE_KEY_LAST_QUARTER = 'life-wheel-reminder-last-quarter'

function getMonthKey(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

function getQuarterKey(d) {
  const y = d.getFullYear()
  const q = Math.floor(d.getMonth() / 3) + 1
  return `${y}-Q${q}`
}

function getDaysInMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
}

/** True nếu date là 2 ngày cuối tháng */
function isLastTwoDaysOfMonth(date) {
  const day = date.getDate()
  const total = getDaysInMonth(date)
  return day >= total - 1
}

/** True nếu date là 2 ngày cuối quý (tháng 3, 6, 9, 12) */
function isLastTwoDaysOfQuarter(date) {
  const month = date.getMonth() + 1
  if (![3, 6, 9, 12].includes(month)) return false
  const day = date.getDate()
  const total = getDaysInMonth(date)
  return day >= total - 1
}

export default function useReminder() {
  const [enabled, setEnabledState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_ENABLED) === 'true'
    } catch {
      return false
    }
  })
  const [permission, setPermission] = useState(
    () => (typeof Notification !== 'undefined' ? Notification.permission : 'denied')
  )

  const setEnabled = useCallback((value) => {
    setEnabledState(value)
    try {
      localStorage.setItem(STORAGE_KEY_ENABLED, value ? 'true' : 'false')
    } catch {}
  }, [])

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return 'unsupported'
    const p = await Notification.requestPermission()
    setPermission(p)
    return p
  }, [])

  // Kiểm tra và gửi nhắc nhở (cuối tháng / cuối quý)
  useEffect(() => {
    if (!enabled || permission !== 'granted' || typeof Notification === 'undefined') return

    const now = new Date()
    const monthKey = getMonthKey(now)
    const quarterKey = getQuarterKey(now)
    const lastMonth = localStorage.getItem(STORAGE_KEY_LAST_MONTH)
    const lastQuarter = localStorage.getItem(STORAGE_KEY_LAST_QUARTER)

    const shouldNotifyMonth = isLastTwoDaysOfMonth(now) && lastMonth !== monthKey
    const shouldNotifyQuarter = isLastTwoDaysOfQuarter(now) && lastQuarter !== quarterKey

    if (shouldNotifyMonth || shouldNotifyQuarter) {
      const title = '🎡 Life Wheel'
      const body = shouldNotifyQuarter && shouldNotifyMonth
        ? 'Sắp kết thúc tháng và quý. Dành chút thời gian đánh giá cân bằng cuộc sống nhé!'
        : shouldNotifyQuarter
          ? 'Sắp kết thúc quý. Đánh giá Life Wheel của bạn!'
          : 'Sắp kết thúc tháng. Lưu snapshot đánh giá nhé!'

      try {
        new Notification(title, { body })
        if (shouldNotifyMonth) localStorage.setItem(STORAGE_KEY_LAST_MONTH, monthKey)
        if (shouldNotifyQuarter) localStorage.setItem(STORAGE_KEY_LAST_QUARTER, quarterKey)
      } catch (e) {
        console.warn('Reminder notification failed:', e)
      }
    }
  }, [enabled, permission])

  return {
    reminderEnabled: enabled,
    setReminderEnabled: setEnabled,
    requestPermission,
    permission,
    isSupported: typeof Notification !== 'undefined',
  }
}
