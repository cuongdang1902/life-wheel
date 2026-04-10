import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../../shared/lib/supabase'

const STORAGE_KEY = 'life-wheel-weekly-plans'
const DEBOUNCE_MS = 1000

// Lấy thứ Hai của tuần chứa date
export function getMonday(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay() // 0=Sun, 1=Mon,...
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

// Format date to YYYY-MM-DD
export function toDateStr(date) {
  return date.toISOString().split('T')[0]
}

// Default 5 roles
const createDefaultRoles = () => [
  { id: `r${Date.now()}_1`, name: 'Vai trò 1', goal: '', note: '', star: false },
  { id: `r${Date.now()}_2`, name: 'Vai trò 2', goal: '', note: '', star: false },
  { id: `r${Date.now()}_3`, name: 'Vai trò 3', goal: '', note: '', star: false },
  { id: `r${Date.now()}_4`, name: 'Vai trò 4', goal: '', note: '', star: false },
  { id: `r${Date.now()}_5`, name: 'Vai trò 5', goal: '', note: '', star: false },
]

const createEmptyPlan = (weekStart) => ({
  id: null,
  weekStart,
  roles: createDefaultRoles(),
  tasks: {},
  reflection: {},
})

export default function useWeeklyPlanner() {
  const [plansByWeek, setPlansByWeek] = useState({})
  const [userId, setUserId] = useState(null)
  const [currentWeekStart, setCurrentWeekStart] = useState(() => toDateStr(getMonday()))
  const [loading, setLoading] = useState(false)
  const [savingStatus, setSavingStatus] = useState('idle')
  const debounceTimer = useRef(null)

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
        if (saved) setPlansByWeek(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading weekly plans from localStorage:', e)
      }
    }
  }, [userId])

  const loadFromSupabase = async (uid) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('weekly_plans')
      .select('*')
      .eq('user_id', uid)
    setLoading(false)
    if (error) { console.error('Error loading weekly plans:', error.message); return }
    const grouped = {}
    ;(data || []).forEach(row => {
      grouped[row.week_start] = {
        id: row.id,
        weekStart: row.week_start,
        roles: row.roles || createDefaultRoles(),
        tasks: row.tasks || {},
        reflection: row.reflection || {},
      }
    })
    setPlansByWeek(grouped)
  }

  const saveLocal = useCallback((newByWeek) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(newByWeek)) }
    catch (e) { console.error(e) }
  }, [])

  // Get plan for a week (create default if not exists)
  const getPlan = useCallback((weekStart) => {
    return plansByWeek[weekStart] || createEmptyPlan(weekStart)
  }, [plansByWeek])

  // Generic update with debounce save
  const updatePlan = useCallback((weekStart, updater) => {
    setSavingStatus('saving')
    setPlansByWeek(prev => {
      const existing = prev[weekStart] || createEmptyPlan(weekStart)
      const updated = updater(existing)
      const next = { ...prev, [weekStart]: updated }
      if (!userId) saveLocal(next)
      return next
    })

    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(async () => {
      if (!userId) {
        setSavingStatus('saved')
        setTimeout(() => setSavingStatus('idle'), 2000)
        return
      }

      setPlansByWeek(prev => {
        const plan = prev[weekStart]
        if (!plan) return prev

        const doSave = async () => {
          try {
            const payload = {
              user_id: userId,
              week_start: weekStart,
              roles: plan.roles,
              tasks: plan.tasks,
              reflection: plan.reflection,
              updated_at: new Date().toISOString(),
            }
            if (plan.id) {
              const { error } = await supabase.from('weekly_plans').update(payload).eq('id', plan.id)
              if (error) throw error
            } else {
              const { data: row, error } = await supabase
                .from('weekly_plans').insert([payload]).select().single()
              if (error) throw error
              setPlansByWeek(p => ({
                ...p,
                [weekStart]: { ...p[weekStart], id: row.id }
              }))
            }
            setSavingStatus('saved')
            setTimeout(() => setSavingStatus('idle'), 2000)
          } catch (err) {
            console.error('Error saving weekly plan:', err.message)
            setSavingStatus('error')
            setTimeout(() => setSavingStatus('idle'), 3000)
          }
        }
        doSave()
        return prev
      })
    }, DEBOUNCE_MS)
  }, [userId, saveLocal])

  // === ROLE FUNCTIONS ===
  const getRoles = useCallback((weekStart) => {
    return getPlan(weekStart).roles || createDefaultRoles()
  }, [getPlan])

  const addRole = useCallback((weekStart) => {
    updatePlan(weekStart, plan => ({
      ...plan,
      roles: [...plan.roles, { id: `r${Date.now()}`, name: `Vai trò ${plan.roles.length + 1}`, goal: '', note: '', star: false }]
    }))
  }, [updatePlan])

  const updateRole = useCallback((weekStart, roleId, changes) => {
    updatePlan(weekStart, plan => ({
      ...plan,
      roles: plan.roles.map(r => r.id === roleId ? { ...r, ...changes } : r)
    }))
  }, [updatePlan])

  const deleteRole = useCallback((weekStart, roleId) => {
    updatePlan(weekStart, plan => {
      const newTasks = { ...plan.tasks }
      // Remove all tasks for this role
      for (let d = 0; d < 7; d++) {
        delete newTasks[`${roleId}:${d}`]
      }
      return {
        ...plan,
        roles: plan.roles.filter(r => r.id !== roleId),
        tasks: newTasks,
      }
    })
  }, [updatePlan])

  const toggleStar = useCallback((weekStart, roleId) => {
    updatePlan(weekStart, plan => ({
      ...plan,
      roles: plan.roles.map(r => r.id === roleId ? { ...r, star: !r.star } : r)
    }))
  }, [updatePlan])

  // === TASK FUNCTIONS ===
  const getTaskKey = (roleId, dayIndex) => `${roleId}:${dayIndex}`

  const getTasks = useCallback((weekStart, roleId, dayIndex) => {
    const plan = getPlan(weekStart)
    return plan.tasks[getTaskKey(roleId, dayIndex)] || []
  }, [getPlan])

  const addTask = useCallback((weekStart, roleId, dayIndex, text) => {
    const key = getTaskKey(roleId, dayIndex)
    updatePlan(weekStart, plan => ({
      ...plan,
      tasks: {
        ...plan.tasks,
        [key]: [
          ...(plan.tasks[key] || []),
          { id: `t${Date.now()}`, text, done: false }
        ]
      }
    }))
  }, [updatePlan])

  const updateTask = useCallback((weekStart, roleId, dayIndex, taskId, changes) => {
    const key = getTaskKey(roleId, dayIndex)
    updatePlan(weekStart, plan => ({
      ...plan,
      tasks: {
        ...plan.tasks,
        [key]: (plan.tasks[key] || []).map(t => t.id === taskId ? { ...t, ...changes } : t)
      }
    }))
  }, [updatePlan])

  const deleteTask = useCallback((weekStart, roleId, dayIndex, taskId) => {
    const key = getTaskKey(roleId, dayIndex)
    updatePlan(weekStart, plan => ({
      ...plan,
      tasks: {
        ...plan.tasks,
        [key]: (plan.tasks[key] || []).filter(t => t.id !== taskId)
      }
    }))
  }, [updatePlan])

  const toggleTask = useCallback((weekStart, roleId, dayIndex, taskId) => {
    const key = getTaskKey(roleId, dayIndex)
    updatePlan(weekStart, plan => ({
      ...plan,
      tasks: {
        ...plan.tasks,
        [key]: (plan.tasks[key] || []).map(t => t.id === taskId ? { ...t, done: !t.done } : t)
      }
    }))
  }, [updatePlan])

  // === REFLECTION ===
  const getReflection = useCallback((weekStart) => {
    return getPlan(weekStart).reflection || {}
  }, [getPlan])

  const saveReflection = useCallback((weekStart, key, value) => {
    updatePlan(weekStart, plan => ({
      ...plan,
      reflection: { ...plan.reflection, [key]: value }
    }))
  }, [updatePlan])

  // === PROGRESS ===
  const getWeekProgress = useCallback((weekStart) => {
    const plan = getPlan(weekStart)
    let total = 0, done = 0
    Object.values(plan.tasks).forEach(taskList => {
      taskList.forEach(t => {
        total++
        if (t.done) done++
      })
    })
    return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 }
  }, [getPlan])

  // === WEEK NAVIGATION ===
  const goToPrevWeek = useCallback(() => {
    setCurrentWeekStart(prev => {
      const d = new Date(prev)
      d.setDate(d.getDate() - 7)
      return toDateStr(d)
    })
  }, [])

  const goToNextWeek = useCallback(() => {
    setCurrentWeekStart(prev => {
      const d = new Date(prev)
      d.setDate(d.getDate() + 7)
      return toDateStr(d)
    })
  }, [])

  const goToCurrentWeek = useCallback(() => {
    setCurrentWeekStart(toDateStr(getMonday()))
  }, [])

  return {
    currentWeekStart,
    loading,
    savingStatus,
    getPlan,
    getRoles,
    addRole,
    updateRole,
    deleteRole,
    toggleStar,
    getTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    getReflection,
    saveReflection,
    getWeekProgress,
    goToPrevWeek,
    goToNextWeek,
    goToCurrentWeek,
  }
}
