import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../../shared/lib/supabase'

const STORAGE_KEY = 'life-wheel-year-review'
const DEBOUNCE_MS = 1000

export default function useYearReview() {
  const [reviewsByYear, setReviewsByYear] = useState({}) // { [year]: { answers: {q1: '', ...}, id, ... } }
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [savingStatus, setSavingStatus] = useState('idle') // 'idle' | 'saving' | 'saved' | 'error'
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

  // Load data when auth changes
  useEffect(() => {
    if (userId) {
      loadFromSupabase(userId)
    } else {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) setReviewsByYear(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading year review from localStorage:', e)
      }
    }
  }, [userId])

  const loadFromSupabase = async (uid) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('year_reviews')
      .select('*')
      .eq('user_id', uid)
    setLoading(false)
    if (error) { console.error('Error loading year reviews:', error.message); return }
    const grouped = {}
    ;(data || []).forEach(row => {
      grouped[row.year] = { id: row.id, answers: row.answers || {}, year: row.year }
    })
    setReviewsByYear(grouped)
  }

  const saveLocal = useCallback((newByYear) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(newByYear)) }
    catch (e) { console.error(e) }
  }, [])

  /**
   * Get answers for a given year (empty if not started)
   */
  const getReview = useCallback((year) => {
    return reviewsByYear[year] || { answers: {}, year }
  }, [reviewsByYear])

  /**
   * Save a single answer with debounce
   */
  const saveAnswer = useCallback((year, questionId, text) => {
    // Optimistic local update immediately
    setReviewsByYear(prev => {
      const existing = prev[year] || { answers: {}, year }
      const next = {
        ...prev,
        [year]: {
          ...existing,
          answers: { ...existing.answers, [questionId]: text }
        }
      }
      if (!userId) saveLocal(next)
      return next
    })

    setSavingStatus('saving')

    // Debounce the actual Supabase save
    if (debounceTimers.current[questionId]) {
      clearTimeout(debounceTimers.current[questionId])
    }
    debounceTimers.current[questionId] = setTimeout(async () => {
      if (!userId) {
        setSavingStatus('saved')
        setTimeout(() => setSavingStatus('idle'), 2000)
        return
      }

      // Get latest state via functional update to avoid stale closure
      setReviewsByYear(prev => {
        const current = prev[year] || { answers: {}, year }
        const answers = { ...current.answers, [questionId]: text }
        const doSave = async () => {
          try {
            if (current.id) {
              // Update existing row
              const { error } = await supabase
                .from('year_reviews')
                .update({ answers, updated_at: new Date().toISOString() })
                .eq('id', current.id)
              if (error) throw error
            } else {
              // Insert new row
              const { data: row, error } = await supabase
                .from('year_reviews')
                .insert([{ user_id: userId, year, answers }])
                .select()
                .single()
              if (error) throw error
              // Update local state with new id
              setReviewsByYear(p => ({
                ...p,
                [year]: { ...p[year], id: row.id }
              }))
            }
            setSavingStatus('saved')
            setTimeout(() => setSavingStatus('idle'), 2000)
          } catch (err) {
            console.error('Error saving answer:', err.message)
            setSavingStatus('error')
            setTimeout(() => setSavingStatus('idle'), 3000)
          }
        }
        doSave()
        return prev
      })
    }, DEBOUNCE_MS)
  }, [userId, saveLocal])

  /**
   * Count answered questions for a given year and section
   */
  const getProgress = useCallback((year, section = 'all') => {
    const review = reviewsByYear[year] || { answers: {} }
    const answers = review.answers || {}

    if (section === 'all') {
      const answered = Object.values(answers).filter(v => v && v.trim().length > 0).length
      return { answered, total: 50 }
    }
    if (section === 'this_year') {
      const ids = Array.from({ length: 30 }, (_, i) => `q${i + 1}`)
      const answered = ids.filter(id => answers[id] && answers[id].trim().length > 0).length
      return { answered, total: 30 }
    }
    if (section === 'next_year') {
      const ids = Array.from({ length: 20 }, (_, i) => `q${i + 31}`)
      const answered = ids.filter(id => answers[id] && answers[id].trim().length > 0).length
      return { answered, total: 20 }
    }
    return { answered: 0, total: 0 }
  }, [reviewsByYear])

  /**
   * Get all years that have any answers
   */
  const getAnsweredYears = useCallback(() => {
    return Object.keys(reviewsByYear)
      .filter(y => {
        const r = reviewsByYear[y]
        return r && Object.values(r.answers || {}).some(v => v && v.trim().length > 0)
      })
      .map(Number)
      .sort((a, b) => b - a)
  }, [reviewsByYear])

  return {
    loading,
    savingStatus,
    getReview,
    saveAnswer,
    getProgress,
    getAnsweredYears,
  }
}
