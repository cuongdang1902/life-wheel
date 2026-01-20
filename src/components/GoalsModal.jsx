import { useState } from 'react'
import { AREAS } from './LifeWheel'
import { PERIODS } from '../hooks/useSnapshots'

export default function GoalsModal({
  isOpen,
  onClose,
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
  isDark = true,
}) {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedArea, setSelectedArea] = useState('health')
  const [newSubGoalTitle, setNewSubGoalTitle] = useState('')
  const [newTaskTexts, setNewTaskTexts] = useState({})
  const [editingObjective, setEditingObjective] = useState(false)
  const [objectiveInput, setObjectiveInput] = useState('')

  if (!isOpen) return null

  const currentGoal = getGoal(selectedPeriod, selectedArea)
  const progress = getProgress(selectedPeriod, selectedArea)
  const currentArea = AREAS.find(a => a.id === selectedArea)

  const handleStartEditObjective = () => {
    setObjectiveInput(currentGoal.objective)
    setEditingObjective(true)
  }

  const handleSaveObjective = () => {
    updateObjective(selectedPeriod, selectedArea, objectiveInput)
    setEditingObjective(false)
  }

  const handleAddSubGoal = () => {
    if (!newSubGoalTitle.trim()) return
    if (addSubGoal(selectedPeriod, selectedArea, newSubGoalTitle.trim())) {
      setNewSubGoalTitle('')
    }
  }

  const handleAddTask = (subGoalId) => {
    const text = newTaskTexts[subGoalId]
    if (!text?.trim()) return
    if (addTask(selectedPeriod, selectedArea, subGoalId, text.trim())) {
      setNewTaskTexts(prev => ({ ...prev, [subGoalId]: '' }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border shadow-2xl ${
        isDark 
          ? 'bg-slate-800 border-slate-700' 
          : 'bg-white border-slate-200'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b flex justify-between items-center ${
          isDark ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              🎯 Goals (OKR)
            </h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Đặt mục tiêu cho từng lĩnh vực và chu kỳ
            </p>
          </div>
          <button
            onClick={onClose}
            className={`text-2xl leading-none ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            ×
          </button>
        </div>

        {/* Selectors */}
        <div className={`px-6 py-4 border-b flex flex-wrap gap-4 ${
          isDark ? 'bg-slate-700/30 border-slate-700' : 'bg-slate-50 border-slate-200'
        }`}>
          {/* Period selector */}
          <div className="flex gap-2">
            {PERIODS.map(period => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === period.value
                    ? 'bg-indigo-600 text-white'
                    : isDark 
                      ? 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>

          {/* Area selector */}
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              isDark 
                ? 'bg-slate-600 text-white border-slate-500' 
                : 'bg-white text-slate-700 border-slate-200'
            } border`}
            style={{ color: currentArea?.color }}
          >
            {AREAS.map(area => (
              <option key={area.id} value={area.id} style={{ color: isDark ? 'white' : 'black' }}>
                {area.name}
              </option>
            ))}
          </select>

          {/* Progress */}
          {progress > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <div className={`w-24 h-2 rounded-full ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`}>
                <div 
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {progress}%
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[55vh] space-y-6">
          {/* Objective */}
          <div className={`p-4 rounded-xl border ${
            isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                🎯 Objective (Mục tiêu chính)
              </h3>
              <span 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: currentArea?.color }}
              />
            </div>
            
            {editingObjective ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={objectiveInput}
                  onChange={(e) => setObjectiveInput(e.target.value)}
                  placeholder="Nhập mục tiêu chính..."
                  className={`flex-1 px-4 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-slate-600 border-slate-500 text-white placeholder-slate-400' 
                      : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
                  }`}
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveObjective()}
                />
                <button
                  onClick={handleSaveObjective}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  ✓
                </button>
                <button
                  onClick={() => setEditingObjective(false)}
                  className={`px-4 py-2 rounded-lg ${
                    isDark ? 'bg-slate-600 hover:bg-slate-500' : 'bg-slate-200 hover:bg-slate-300'
                  }`}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div
                onClick={handleStartEditObjective}
                className={`px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                  currentGoal.objective 
                    ? isDark ? 'bg-slate-600/50' : 'bg-white'
                    : isDark ? 'bg-slate-600/30 border-2 border-dashed border-slate-500' : 'bg-white/50 border-2 border-dashed border-slate-300'
                }`}
              >
                {currentGoal.objective ? (
                  <p className={`text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {currentGoal.objective}
                  </p>
                ) : (
                  <p className={isDark ? 'text-slate-400' : 'text-slate-400'}>
                    + Nhấn để thêm mục tiêu chính...
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Sub-goals */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                📋 Sub-goals (Mục tiêu con) 
                <span className={`text-sm font-normal ml-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {currentGoal.subGoals.length}/3
                </span>
              </h3>
            </div>

            <div className="space-y-4">
              {currentGoal.subGoals.map((subGoal, index) => (
                <div 
                  key={subGoal.id}
                  className={`p-4 rounded-xl border ${
                    isDark ? 'bg-slate-700/30 border-slate-600' : 'bg-white border-slate-200'
                  }`}
                >
                  {/* Sub-goal header */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                      isDark ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-600'
                    }`}>
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={subGoal.title}
                      onChange={(e) => updateSubGoal(selectedPeriod, selectedArea, subGoal.id, e.target.value)}
                      className={`flex-1 px-3 py-1 rounded-lg border-none bg-transparent font-medium ${
                        isDark ? 'text-white' : 'text-slate-800'
                      }`}
                      placeholder="Tên mục tiêu con..."
                    />
                    <button
                      onClick={() => deleteSubGoal(selectedPeriod, selectedArea, subGoal.id)}
                      className="text-red-400 hover:text-red-300 text-lg"
                    >
                      🗑️
                    </button>
                  </div>

                  {/* Tasks */}
                  <div className="ml-9 space-y-2">
                    {subGoal.tasks.map(task => (
                      <div key={task.id} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={task.done}
                          onChange={() => toggleTask(selectedPeriod, selectedArea, subGoal.id, task.id)}
                          className="w-5 h-5 rounded border-slate-400 text-green-500 focus:ring-green-500"
                        />
                        <input
                          type="text"
                          value={task.text}
                          onChange={(e) => updateTask(selectedPeriod, selectedArea, subGoal.id, task.id, { text: e.target.value })}
                          className={`flex-1 px-2 py-1 rounded bg-transparent ${
                            task.done 
                              ? 'line-through opacity-50' 
                              : ''
                          } ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
                        />
                        <button
                          onClick={() => deleteTask(selectedPeriod, selectedArea, subGoal.id, task.id)}
                          className="text-red-400 hover:text-red-300 opacity-50 hover:opacity-100"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {/* Add task */}
                    {subGoal.tasks.length < 3 && (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newTaskTexts[subGoal.id] || ''}
                          onChange={(e) => setNewTaskTexts(prev => ({ ...prev, [subGoal.id]: e.target.value }))}
                          placeholder="+ Thêm task..."
                          className={`flex-1 px-3 py-1 rounded-lg text-sm ${
                            isDark 
                              ? 'bg-slate-600/50 text-white placeholder-slate-400' 
                              : 'bg-slate-100 text-slate-700 placeholder-slate-400'
                          }`}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddTask(subGoal.id)}
                        />
                        <button
                          onClick={() => handleAddTask(subGoal.id)}
                          className={`px-3 py-1 rounded-lg text-sm ${
                            isDark 
                              ? 'bg-slate-600 hover:bg-slate-500 text-white' 
                              : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                          }`}
                        >
                          +
                        </button>
                      </div>
                    )}
                    {subGoal.tasks.length >= 3 && (
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        Đã đạt giới hạn 3 tasks
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {/* Add sub-goal */}
              {currentGoal.subGoals.length < 3 && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubGoalTitle}
                    onChange={(e) => setNewSubGoalTitle(e.target.value)}
                    placeholder="+ Thêm mục tiêu con..."
                    className={`flex-1 px-4 py-3 rounded-xl border ${
                      isDark 
                        ? 'bg-slate-700/30 border-slate-600 text-white placeholder-slate-400' 
                        : 'bg-slate-50 border-slate-200 text-slate-700 placeholder-slate-400'
                    }`}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSubGoal()}
                  />
                  <button
                    onClick={handleAddSubGoal}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium"
                  >
                    Thêm
                  </button>
                </div>
              )}
              {currentGoal.subGoals.length >= 3 && (
                <p className={`text-sm text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Đã đạt giới hạn 3 mục tiêu con
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t text-center ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-xl font-medium transition-colors ${
              isDark 
                ? 'bg-slate-600 hover:bg-slate-500 text-white' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
