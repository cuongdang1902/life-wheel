import { useState } from 'react'
import { AREAS } from './LifeWheel'
import { PERIODS } from '../hooks/useSnapshots'

export default function GoalsDashboard({
  isOpen,
  onClose,
  getGoal,
  toggleTask,
  getProgress,
  isDark = true,
}) {
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  if (!isOpen) return null

  // Get all areas with goals for the selected period
  const areasWithGoals = AREAS.map(area => ({
    ...area,
    goal: getGoal(selectedPeriod, area.id),
    progress: getProgress(selectedPeriod, area.id),
  }))

  // Calculate overall progress
  const totalTasks = areasWithGoals.reduce((acc, area) => {
    return acc + area.goal.subGoals.reduce((sum, sg) => sum + sg.tasks.length, 0)
  }, 0)
  
  const completedTasks = areasWithGoals.reduce((acc, area) => {
    return acc + area.goal.subGoals.reduce((sum, sg) => 
      sum + sg.tasks.filter(t => t.done).length, 0)
  }, 0)
  
  const overallProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border shadow-2xl ${
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
              📊 Goals Dashboard
            </h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Theo dõi tiến độ mục tiêu realtime
            </p>
          </div>
          
          {/* Overall progress */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Tiến độ tổng
              </div>
              <div className={`text-2xl font-bold ${
                overallProgress >= 70 ? 'text-green-500' : 
                overallProgress >= 40 ? 'text-yellow-500' : 'text-red-400'
              }`}>
                {overallProgress}%
              </div>
            </div>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
              isDark ? 'bg-slate-700' : 'bg-slate-100'
            }`} style={{
              background: `conic-gradient(${
                overallProgress >= 70 ? '#22c55e' : 
                overallProgress >= 40 ? '#eab308' : '#f87171'
              } ${overallProgress * 3.6}deg, ${isDark ? '#334155' : '#e2e8f0'} 0deg)`
            }}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                isDark ? 'bg-slate-800' : 'bg-white'
              }`}>
                <span className="text-lg font-bold">{completedTasks}/{totalTasks}</span>
              </div>
            </div>
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

        {/* Period selector */}
        <div className={`px-6 py-4 border-b flex gap-2 ${
          isDark ? 'bg-slate-700/30 border-slate-700' : 'bg-slate-50 border-slate-200'
        }`}>
          {PERIODS.map(period => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
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

        {/* Dashboard Grid */}
        <div className="p-6 overflow-y-auto max-h-[65vh]">
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            {areasWithGoals.map(area => (
              <div 
                key={area.id}
                className={`rounded-xl border overflow-hidden ${
                  isDark ? 'bg-slate-700/30 border-slate-600' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                {/* Area header */}
                <div 
                  className="px-4 py-3 flex items-center justify-between"
                  style={{ backgroundColor: `${area.color}20` }}
                >
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: area.color }}
                    />
                    <span 
                      className="font-semibold text-sm"
                      style={{ color: area.color }}
                    >
                      {area.name}
                    </span>
                  </div>
                  {area.progress > 0 && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      area.progress >= 70 ? 'bg-green-500/20 text-green-500' :
                      area.progress >= 40 ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-red-400/20 text-red-400'
                    }`}>
                      {area.progress}%
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  {/* Objective */}
                  {area.goal.objective ? (
                    <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      🎯 {area.goal.objective}
                    </div>
                  ) : (
                    <div className={`text-sm italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      Chưa có mục tiêu
                    </div>
                  )}

                  {/* Sub-goals & Tasks */}
                  {area.goal.subGoals.length > 0 && (
                    <div className="space-y-2">
                      {area.goal.subGoals.map((subGoal, idx) => (
                        <div key={subGoal.id} className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          <div className="font-medium mb-1">
                            {idx + 1}. {subGoal.title}
                          </div>
                          {subGoal.tasks.length > 0 && (
                            <div className="ml-3 space-y-1">
                              {subGoal.tasks.map(task => (
                                <label 
                                  key={task.id} 
                                  className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                                >
                                  <input
                                    type="checkbox"
                                    checked={task.done}
                                    onChange={() => toggleTask(selectedPeriod, area.id, subGoal.id, task.id)}
                                    className="w-4 h-4 rounded border-slate-400 text-green-500 focus:ring-green-500"
                                  />
                                  <span className={task.done ? 'line-through opacity-50' : ''}>
                                    {task.text}
                                  </span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Progress bar */}
                  {area.goal.subGoals.length > 0 && (
                    <div className={`w-full h-1.5 rounded-full mt-2 ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`}>
                      <div 
                        className="h-full rounded-full transition-all duration-300"
                        style={{ 
                          width: `${area.progress}%`,
                          backgroundColor: area.color 
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
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
