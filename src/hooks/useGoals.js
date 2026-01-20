import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

// Helper: Generate period_key from date
function getPeriodKey(period, date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  
  switch (period) {
    case 'week':
      const week = getWeekNumber(date)
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

const createEmptyGoal = () => ({
  objective: '',
  subGoals: [],
})

export default function useGoals() {
  const { user } = useAuth()
  const [goals, setGoals] = useState({}) // { [period]: { [areaId]: { objective, subGoals } } }
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch all goals from Supabase
  const fetchGoals = useCallback(async () => {
    if (!user) {
      setGoals({})
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('life_goals')
        .select('*')
        .eq('user_id', user.id)

      if (fetchError) throw fetchError

      // Transform to app format: { [period_type]: { [area_id]: goal } }
      const transformed = {}
      data.forEach(goal => {
        const key = `${goal.period_type}:${goal.period_key}`
        if (!transformed[key]) transformed[key] = {}
        transformed[key][goal.area_id] = {
          id: goal.id,
          objective: goal.objective || '',
          subGoals: goal.sub_goals || [],
        }
      })

      setGoals(transformed)
    } catch (err) {
      console.error('Error fetching goals:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Load goals on mount
  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  // Get goal for a specific period and area
  const getGoal = useCallback((period, areaId) => {
    const periodKey = getPeriodKey(period)
    const key = `${period}:${periodKey}`
    return goals[key]?.[areaId] || createEmptyGoal()
  }, [goals])

  // Upsert goal (create or update)
  const upsertGoal = useCallback(async (period, areaId, goalData) => {
    if (!user) return null

    try {
      setError(null)
      const periodKey = getPeriodKey(period)

      const { data, error: upsertError } = await supabase
        .from('life_goals')
        .upsert({
          user_id: user.id,
          period_type: period,
          period_key: periodKey,
          area_id: areaId,
          objective: goalData.objective || '',
          sub_goals: goalData.subGoals || [],
        }, {
          onConflict: 'user_id,period_type,period_key,area_id'
        })
        .select()
        .single()

      if (upsertError) throw upsertError

      // Update local state
      const key = `${period}:${periodKey}`
      setGoals(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          [areaId]: {
            id: data.id,
            objective: data.objective || '',
            subGoals: data.sub_goals || [],
          }
        }
      }))

      return data
    } catch (err) {
      console.error('Error upserting goal:', err)
      setError(err.message)
      return null
    }
  }, [user])

  // Update objective
  const updateObjective = useCallback(async (period, areaId, objective) => {
    const currentGoal = getGoal(period, areaId)
    return upsertGoal(period, areaId, {
      ...currentGoal,
      objective,
    })
  }, [getGoal, upsertGoal])

  // Add sub-goal (max 3)
  const addSubGoal = useCallback(async (period, areaId, title) => {
    const currentGoal = getGoal(period, areaId)
    if (currentGoal.subGoals.length >= 3) return false

    const newSubGoal = {
      id: Date.now().toString(),
      title,
      tasks: [],
    }

    await upsertGoal(period, areaId, {
      ...currentGoal,
      subGoals: [...currentGoal.subGoals, newSubGoal],
    })
    return true
  }, [getGoal, upsertGoal])

  // Update sub-goal title
  const updateSubGoal = useCallback(async (period, areaId, subGoalId, title) => {
    const currentGoal = getGoal(period, areaId)
    const updatedSubGoals = currentGoal.subGoals.map(sg =>
      sg.id === subGoalId ? { ...sg, title } : sg
    )

    await upsertGoal(period, areaId, {
      ...currentGoal,
      subGoals: updatedSubGoals,
    })
  }, [getGoal, upsertGoal])

  // Delete sub-goal
  const deleteSubGoal = useCallback(async (period, areaId, subGoalId) => {
    const currentGoal = getGoal(period, areaId)
    const updatedSubGoals = currentGoal.subGoals.filter(sg => sg.id !== subGoalId)

    await upsertGoal(period, areaId, {
      ...currentGoal,
      subGoals: updatedSubGoals,
    })
  }, [getGoal, upsertGoal])

  // Add task to sub-goal (max 3)
  const addTask = useCallback(async (period, areaId, subGoalId, text) => {
    const currentGoal = getGoal(period, areaId)
    const subGoal = currentGoal.subGoals.find(sg => sg.id === subGoalId)
    if (!subGoal || subGoal.tasks.length >= 3) return false

    const newTask = {
      id: Date.now().toString(),
      text,
      done: false,
    }

    const updatedSubGoals = currentGoal.subGoals.map(sg =>
      sg.id === subGoalId ? { ...sg, tasks: [...sg.tasks, newTask] } : sg
    )

    await upsertGoal(period, areaId, {
      ...currentGoal,
      subGoals: updatedSubGoals,
    })
    return true
  }, [getGoal, upsertGoal])

  // Update task
  const updateTask = useCallback(async (period, areaId, subGoalId, taskId, updates) => {
    const currentGoal = getGoal(period, areaId)
    const updatedSubGoals = currentGoal.subGoals.map(sg => {
      if (sg.id !== subGoalId) return sg
      return {
        ...sg,
        tasks: sg.tasks.map(t =>
          t.id === taskId ? { ...t, ...updates } : t
        )
      }
    })

    await upsertGoal(period, areaId, {
      ...currentGoal,
      subGoals: updatedSubGoals,
    })
  }, [getGoal, upsertGoal])

  // Delete task
  const deleteTask = useCallback(async (period, areaId, subGoalId, taskId) => {
    const currentGoal = getGoal(period, areaId)
    const updatedSubGoals = currentGoal.subGoals.map(sg => {
      if (sg.id !== subGoalId) return sg
      return {
        ...sg,
        tasks: sg.tasks.filter(t => t.id !== taskId)
      }
    })

    await upsertGoal(period, areaId, {
      ...currentGoal,
      subGoals: updatedSubGoals,
    })
  }, [getGoal, upsertGoal])

  // Toggle task done
  const toggleTask = useCallback(async (period, areaId, subGoalId, taskId) => {
    const currentGoal = getGoal(period, areaId)
    const subGoal = currentGoal.subGoals.find(sg => sg.id === subGoalId)
    const task = subGoal?.tasks.find(t => t.id === taskId)
    
    if (task) {
      await updateTask(period, areaId, subGoalId, taskId, { done: !task.done })
    }
  }, [getGoal, updateTask])

  // Calculate progress for an area
  const getProgress = useCallback((period, areaId) => {
    const goal = getGoal(period, areaId)
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
  }, [getGoal])

  return {
    goals,
    loading,
    error,
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
    refetch: fetchGoals,
  }
}
