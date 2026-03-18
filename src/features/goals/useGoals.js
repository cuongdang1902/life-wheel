import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../shared/lib/supabase'

const STORAGE_KEY = 'life-wheel-goals'

const createEmptyGoal = () => ({
  objective: '',
  subGoals: [],
})

export default function useGoals() {
  const [goals, setGoals] = useState({})
  const [userId, setUserId] = useState(null)

  // Theo dõi trạng thái đăng nhập
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Load goals theo trạng thái đăng nhập
  useEffect(() => {
    if (userId) {
      loadFromSupabase(userId)
    } else {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) setGoals(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading goals from localStorage:', e)
      }
    }
  }, [userId])

  const loadFromSupabase = async (uid) => {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', uid)
    if (error) {
      console.error('Error loading goals from Supabase:', error.message)
      return
    }
    // Chuẩn hóa dữ liệu flat từ Supabase thành cấu trúc lồng nhau { period: { areaId: { objective, subGoals } } }
    const normalized = {}
    data.forEach(row => {
      if (!normalized[row.period]) normalized[row.period] = {}
      normalized[row.period][row.area_id] = {
        _supabaseId: row.id, // lưu id để update sau
        objective: row.objective || '',
        subGoals: row.sub_goals || [],
      }
    })
    setGoals(normalized)
  }

  const saveToLocalStorage = useCallback((newGoals) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newGoals))
      setGoals(newGoals)
    } catch (e) {
      console.error('Error saving goals to localStorage:', e)
    }
  }, [])

  const getGoal = useCallback((period, areaId) => {
    return goals[period]?.[areaId] || createEmptyGoal()
  }, [goals])

  // Helper: Sync 1 goal lên Supabase (upsert)
  const syncGoalToSupabase = useCallback(async (period, areaId, goalData) => {
    if (!userId) return
    const existingId = goalData._supabaseId
    const payload = {
      user_id: userId,
      period,
      area_id: areaId,
      objective: goalData.objective,
      sub_goals: goalData.subGoals,
      updated_at: new Date().toISOString(),
    }
    if (existingId) {
      // Update bản ghi đã tồn tại
      const { error } = await supabase.from('goals').update(payload).eq('id', existingId)
      if (error) console.error('Error updating goal:', error.message)
    } else {
      // Tạo bản ghi mới và lưu id lại
      const { data, error } = await supabase.from('goals').insert([payload]).select().single()
      if (error) { console.error('Error inserting goal:', error.message); return }
      // Gắn id mới vào state local để lần sau update đúng
      setGoals(prev => {
        const updated = { ...prev }
        if (updated[period]?.[areaId]) updated[period][areaId]._supabaseId = data.id
        return updated
      })
    }
  }, [userId])

  const updateState = useCallback((period, areaId, updater) => {
    setGoals(prev => {
      const newGoals = { ...prev }
      // Deep-clone nhánh period → areaId để tránh mutation chéo
      newGoals[period] = { ...(newGoals[period] || {}) }
      const currentGoal = newGoals[period][areaId]
        ? {
            ...newGoals[period][areaId],
            subGoals: newGoals[period][areaId].subGoals.map(sg => ({
              ...sg,
              tasks: sg.tasks.map(t => ({ ...t })),
            })),
          }
        : createEmptyGoal()
      newGoals[period][areaId] = updater(currentGoal)
      if (!userId) {
        // Ghi localStorage khi chưa đăng nhập
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(newGoals)) } catch (e) { console.error(e) }
      }
      return newGoals
    })
  }, [userId])

  const updateObjective = useCallback((period, areaId, objective) => {
    updateState(period, areaId, (goal) => {
      const updated = { ...goal, objective }
      syncGoalToSupabase(period, areaId, updated)
      return updated
    })
  }, [updateState, syncGoalToSupabase])

  const addSubGoal = useCallback((period, areaId, title) => {
    let success = false
    updateState(period, areaId, (goal) => {
      if (goal.subGoals.length >= 3) return goal
      const updated = { ...goal, subGoals: [...goal.subGoals, { id: Date.now().toString(), title, tasks: [] }] }
      syncGoalToSupabase(period, areaId, updated)
      success = true
      return updated
    })
    return success
  }, [updateState, syncGoalToSupabase])

  const updateSubGoal = useCallback((period, areaId, subGoalId, title) => {
    updateState(period, areaId, (goal) => {
      const updated = { ...goal, subGoals: goal.subGoals.map(sg => sg.id === subGoalId ? { ...sg, title } : sg) }
      syncGoalToSupabase(period, areaId, updated)
      return updated
    })
  }, [updateState, syncGoalToSupabase])

  const deleteSubGoal = useCallback((period, areaId, subGoalId) => {
    updateState(period, areaId, (goal) => {
      const updated = { ...goal, subGoals: goal.subGoals.filter(sg => sg.id !== subGoalId) }
      syncGoalToSupabase(period, areaId, updated)
      return updated
    })
  }, [updateState, syncGoalToSupabase])

  const addTask = useCallback((period, areaId, subGoalId, text) => {
    let success = false
    updateState(period, areaId, (goal) => {
      const subGoals = goal.subGoals.map(sg => {
        if (sg.id !== subGoalId || sg.tasks.length >= 3) return sg
        success = true
        return { ...sg, tasks: [...sg.tasks, { id: Date.now().toString(), text, done: false }] }
      })
      const updated = { ...goal, subGoals }
      syncGoalToSupabase(period, areaId, updated)
      return updated
    })
    return success
  }, [updateState, syncGoalToSupabase])

  const updateTask = useCallback((period, areaId, subGoalId, taskId, updates) => {
    updateState(period, areaId, (goal) => {
      const subGoals = goal.subGoals.map(sg =>
        sg.id === subGoalId
          ? { ...sg, tasks: sg.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t) }
          : sg
      )
      const updated = { ...goal, subGoals }
      syncGoalToSupabase(period, areaId, updated)
      return updated
    })
  }, [updateState, syncGoalToSupabase])

  const deleteTask = useCallback((period, areaId, subGoalId, taskId) => {
    updateState(period, areaId, (goal) => {
      const subGoals = goal.subGoals.map(sg =>
        sg.id === subGoalId ? { ...sg, tasks: sg.tasks.filter(t => t.id !== taskId) } : sg
      )
      const updated = { ...goal, subGoals }
      syncGoalToSupabase(period, areaId, updated)
      return updated
    })
  }, [updateState, syncGoalToSupabase])

  const toggleTask = useCallback((period, areaId, subGoalId, taskId) => {
    updateState(period, areaId, (goal) => {
      const subGoals = goal.subGoals.map(sg =>
        sg.id === subGoalId
          ? { ...sg, tasks: sg.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t) }
          : sg
      )
      const updated = { ...goal, subGoals }
      syncGoalToSupabase(period, areaId, updated)
      return updated
    })
  }, [updateState, syncGoalToSupabase])

  // Xóa toàn bộ mục tiêu (objective + subGoals) của 1 period+area
  const clearGoal = useCallback(async (period, areaId) => {
    const existingId = goals[period]?.[areaId]?._supabaseId
    if (userId && existingId) {
      // Xóa hẳn row trên Supabase
      const { error } = await supabase.from('goals').delete().eq('id', existingId)
      if (error) console.error('Error deleting goal:', error.message)
    }
    // Xóa khỏi local state
    setGoals(prev => {
      const newGoals = { ...prev }
      if (newGoals[period]) {
        newGoals[period] = { ...newGoals[period] }
        delete newGoals[period][areaId]
      }
      if (!userId) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(newGoals)) } catch (e) { console.error(e) }
      }
      return newGoals
    })
  }, [goals, userId])

  const getProgress = useCallback((period, areaId) => {
    const goal = goals[period]?.[areaId]
    if (!goal || goal.subGoals.length === 0) return 0
    let totalTasks = 0
    let doneTasks = 0
    goal.subGoals.forEach(sg => {
      sg.tasks.forEach(t => {
        totalTasks++
        if (t.done) doneTasks++
      })
    })
    return totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100)
  }, [goals])

  return {
    goals,
    getGoal,
    updateObjective,
    addSubGoal,
    updateSubGoal,
    deleteSubGoal,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    getProgress,
    clearGoal,
  }
}
