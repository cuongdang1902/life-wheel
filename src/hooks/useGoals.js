import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'life-wheel-goals'

// Structure:
// goals[period][areaId] = {
//   objective: string,
//   subGoals: [{ id, title, tasks: [{ id, text, done }] }]
// }

const createEmptyGoal = () => ({
  objective: '',
  subGoals: [],
})

export default function useGoals() {
  const [goals, setGoals] = useState({})

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setGoals(JSON.parse(saved))
      }
    } catch (e) {
      console.error('Error loading goals:', e)
    }
  }, [])

  // Save to localStorage
  const saveToStorage = useCallback((newGoals) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newGoals))
      setGoals(newGoals)
    } catch (e) {
      console.error('Error saving goals:', e)
    }
  }, [])

  // Get goal for a specific period and area
  const getGoal = useCallback((period, areaId) => {
    return goals[period]?.[areaId] || createEmptyGoal()
  }, [goals])

  // Update objective
  const updateObjective = useCallback((period, areaId, objective) => {
    const newGoals = { ...goals }
    if (!newGoals[period]) newGoals[period] = {}
    if (!newGoals[period][areaId]) newGoals[period][areaId] = createEmptyGoal()
    newGoals[period][areaId].objective = objective
    saveToStorage(newGoals)
  }, [goals, saveToStorage])

  // Add sub-goal (max 3)
  const addSubGoal = useCallback((period, areaId, title) => {
    const newGoals = { ...goals }
    if (!newGoals[period]) newGoals[period] = {}
    if (!newGoals[period][areaId]) newGoals[period][areaId] = createEmptyGoal()
    
    const subGoals = newGoals[period][areaId].subGoals
    if (subGoals.length >= 3) return false // Max 3 sub-goals
    
    subGoals.push({
      id: Date.now().toString(),
      title,
      tasks: [],
    })
    saveToStorage(newGoals)
    return true
  }, [goals, saveToStorage])

  // Update sub-goal title
  const updateSubGoal = useCallback((period, areaId, subGoalId, title) => {
    const newGoals = { ...goals }
    const subGoal = newGoals[period]?.[areaId]?.subGoals?.find(sg => sg.id === subGoalId)
    if (subGoal) {
      subGoal.title = title
      saveToStorage(newGoals)
    }
  }, [goals, saveToStorage])

  // Delete sub-goal
  const deleteSubGoal = useCallback((period, areaId, subGoalId) => {
    const newGoals = { ...goals }
    if (newGoals[period]?.[areaId]) {
      newGoals[period][areaId].subGoals = newGoals[period][areaId].subGoals.filter(
        sg => sg.id !== subGoalId
      )
      saveToStorage(newGoals)
    }
  }, [goals, saveToStorage])

  // Add task to sub-goal (max 3)
  const addTask = useCallback((period, areaId, subGoalId, text) => {
    const newGoals = { ...goals }
    const subGoal = newGoals[period]?.[areaId]?.subGoals?.find(sg => sg.id === subGoalId)
    if (!subGoal) return false
    if (subGoal.tasks.length >= 3) return false // Max 3 tasks
    
    subGoal.tasks.push({
      id: Date.now().toString(),
      text,
      done: false,
    })
    saveToStorage(newGoals)
    return true
  }, [goals, saveToStorage])

  // Update task
  const updateTask = useCallback((period, areaId, subGoalId, taskId, updates) => {
    const newGoals = { ...goals }
    const subGoal = newGoals[period]?.[areaId]?.subGoals?.find(sg => sg.id === subGoalId)
    if (!subGoal) return
    
    const task = subGoal.tasks.find(t => t.id === taskId)
    if (task) {
      Object.assign(task, updates)
      saveToStorage(newGoals)
    }
  }, [goals, saveToStorage])

  // Delete task
  const deleteTask = useCallback((period, areaId, subGoalId, taskId) => {
    const newGoals = { ...goals }
    const subGoal = newGoals[period]?.[areaId]?.subGoals?.find(sg => sg.id === subGoalId)
    if (subGoal) {
      subGoal.tasks = subGoal.tasks.filter(t => t.id !== taskId)
      saveToStorage(newGoals)
    }
  }, [goals, saveToStorage])

  // Toggle task done
  const toggleTask = useCallback((period, areaId, subGoalId, taskId) => {
    const newGoals = { ...goals }
    const subGoal = newGoals[period]?.[areaId]?.subGoals?.find(sg => sg.id === subGoalId)
    if (!subGoal) return
    
    const task = subGoal.tasks.find(t => t.id === taskId)
    if (task) {
      task.done = !task.done
      saveToStorage(newGoals)
    }
  }, [goals, saveToStorage])

  // Calculate progress for an area
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
  }
}
