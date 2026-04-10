import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../../shared/lib/supabase'

const STORAGE_KEY = 'life-wheel-monthly-reviews'
const DEBOUNCE_MS = 1000

export default function useMonthlyReview() {
  const [reviewsByKey, setReviewsByKey] = useState({}) // { "2026-3": { id, answers } }
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [savingStatus, setSavingStatus] = useState('idle')
  const debounceTimers = useRef({})

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
        if (saved) setReviewsByKey(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading monthly reviews:', e)
      }
    }
  }, [userId])

  const loadFromSupabase = async (uid) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('monthly_reviews')
      .select('*')
      .eq('user_id', uid)
    setLoading(false)
    if (error) { console.error('Error loading monthly reviews:', error.message); return }
    const grouped = {}
    ;(data || []).forEach(row => {
      const key = `${row.year}-${row.month}`
      grouped[key] = { id: row.id, answers: row.answers || {}, year: row.year, month: row.month }
    })
    setReviewsByKey(grouped)
  }

  const saveLocal = useCallback((newByKey) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(newByKey)) }
    catch (e) { console.error(e) }
  }, [])

  const getReview = useCallback((year, month) => {
    const key = `${year}-${month}`
    return reviewsByKey[key] || { answers: {}, year, month }
  }, [reviewsByKey])

  const saveAnswer = useCallback((year, month, questionId, text) => {
    const key = `${year}-${month}`

    setReviewsByKey(prev => {
      const existing = prev[key] || { answers: {}, year, month }
      const next = {
        ...prev,
        [key]: { ...existing, answers: { ...existing.answers, [questionId]: text } }
      }
      if (!userId) saveLocal(next)
      return next
    })

    setSavingStatus('saving')

    if (debounceTimers.current[key + questionId]) {
      clearTimeout(debounceTimers.current[key + questionId])
    }
    debounceTimers.current[key + questionId] = setTimeout(async () => {
      if (!userId) {
        setSavingStatus('saved')
        setTimeout(() => setSavingStatus('idle'), 2000)
        return
      }

      setReviewsByKey(prev => {
        const current = prev[key] || { answers: {}, year, month }
        const answers = { ...current.answers, [questionId]: text }

        const doSave = async () => {
          try {
            if (current.id) {
              const { error } = await supabase
                .from('monthly_reviews')
                .update({ answers, updated_at: new Date().toISOString() })
                .eq('id', current.id)
              if (error) throw error
            } else {
              const { data: row, error } = await supabase
                .from('monthly_reviews')
                .insert([{ user_id: userId, year, month, answers }])
                .select().single()
              if (error) throw error
              setReviewsByKey(p => ({
                ...p,
                [key]: { ...p[key], id: row.id }
              }))
            }
            setSavingStatus('saved')
            setTimeout(() => setSavingStatus('idle'), 2000)
          } catch (err) {
            console.error('Error saving monthly review:', err.message)
            setSavingStatus('error')
            setTimeout(() => setSavingStatus('idle'), 3000)
          }
        }
        doSave()
        return prev
      })
    }, DEBOUNCE_MS)
  }, [userId, saveLocal])

  const getProgress = useCallback((year, month) => {
    const key = `${year}-${month}`
    const review = reviewsByKey[key] || { answers: {} }
    const answered = Object.values(review.answers || {}).filter(v => v && v.trim().length > 0).length
    return { answered, total: 15 }
  }, [reviewsByKey])

  return { loading, savingStatus, getReview, saveAnswer, getProgress }
}
