import { useState, useMemo } from 'react'
import { AREAS } from '../features/wheel/LifeWheel'
import NavIcon from '../shared/components/NavIcon'

const currentDate = new Date()
const currentYear = currentDate.getFullYear()
const currentMonth = currentDate.getMonth() + 1
const currentQuarter = Math.ceil(currentMonth / 3)

const YEARS = Array.from({ length: 31 }, (_, i) => currentYear - 10 + i)
const QUARTERS = [1, 2, 3, 4]
const MONTHS_IN_QUARTER = {
  1: [1, 2, 3],
  2: [4, 5, 6],
  3: [7, 8, 9],
  4: [10, 11, 12],
}
const MONTH_NAMES = [
  '', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6',
  'T7', 'T8', 'T9', 'T10', 'T11', 'T12',
]

const monthKey = (y, m) => `${y}-${String(m).padStart(2, '0')}`

export default function DashboardPage({
  getGoal,
  toggleTask,
  getProgress,
  isDark = true,
}) {
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [selectedQuarter, setSelectedQuarter] = useState(currentQuarter)

  // Lấy period key = tháng hiện tại trong quý đã chọn
  const monthsInQuarter = MONTHS_IN_QUARTER[selectedQuarter]

  // Get all areas with goals for each month in the selected quarter
  const areasWithGoals = useMemo(() => {
    return AREAS.map(area => {
      let totalTasks = 0
      let doneTasks = 0
      const monthGoals = monthsInQuarter.map(m => {
        const key = monthKey(selectedYear, m)
        const goal = getGoal(key, area.id)
        const prog = getProgress(key, area.id)
        goal.subGoals.forEach(sg => {
          sg.tasks.forEach(t => {
            totalTasks++
            if (t.done) doneTasks++
          })
        })
        return { month: m, key, goal, progress: prog }
      })
      const overallProgress = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100)
      return { ...area, monthGoals, overallProgress, totalTasks, doneTasks }
    })
  }, [selectedYear, selectedQuarter, getGoal, getProgress])

  // Overall stats
  const totalAllTasks = areasWithGoals.reduce((acc, a) => acc + a.totalTasks, 0)
  const completedAllTasks = areasWithGoals.reduce((acc, a) => acc + a.doneTasks, 0)
  const overallProgress = totalAllTasks === 0 ? 0 : Math.round((completedAllTasks / totalAllTasks) * 100)

  return (
    <div className={`rounded-2xl w-full mx-auto max-w-6xl overflow-hidden border shadow-xl ${isDark
      ? 'bg-slate-800 border-slate-700'
      : 'bg-white border-slate-200'
      }`}>
      {/* Header */}
      <div className={`p-6 border-b flex justify-between items-center ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
        <div>
          <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            <NavIcon id="dashboard" size="w-6 h-6" /> Goals Dashboard
          </h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Theo dõi tiến độ mục tiêu Quý {selectedQuarter}/{selectedYear}
          </p>
        </div>

        {/* Overall progress */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Tiến độ tổng
            </div>
            <div className={`text-2xl font-bold ${overallProgress >= 70 ? 'text-green-500' :
              overallProgress >= 40 ? 'text-yellow-500' : 'text-red-400'
              }`}>
              {overallProgress}%
            </div>
          </div>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center`} style={{
            background: `conic-gradient(${overallProgress >= 70 ? '#22c55e' :
              overallProgress >= 40 ? '#eab308' : '#f87171'
              } ${overallProgress * 3.6}deg, ${isDark ? '#334155' : '#e2e8f0'} 0deg)`
          }}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
              <span className="text-lg font-bold">{completedAllTasks}/{totalAllTasks}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Period selector */}
      <div className={`px-6 py-4 border-b flex flex-wrap gap-3 items-center ${isDark ? 'bg-slate-700/30 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${isDark
            ? 'bg-slate-600 text-white border-slate-500'
            : 'bg-white text-slate-700 border-slate-300'
            }`}
        >
          {YEARS.map(y => (
            <option key={y} value={y}>Năm {y}</option>
          ))}
        </select>

        <div className={`flex rounded-lg overflow-hidden border ${isDark ? 'border-slate-600' : 'border-slate-300'}`}>
          {QUARTERS.map(q => (
            <button
              key={q}
              onClick={() => setSelectedQuarter(q)}
              className={`px-4 py-1.5 text-sm font-medium transition-colors ${selectedQuarter === q
                ? 'bg-indigo-600 text-white'
                : isDark
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
            >
              Q{q}
            </button>
          ))}
        </div>

        <span className={`ml-auto text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {MONTH_NAMES[monthsInQuarter[0]]} – {MONTH_NAMES[monthsInQuarter[2]]} / {selectedYear}
        </span>
      </div>

      {/* Dashboard Grid */}
      <div className="p-6">
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          {areasWithGoals.map(area => (
            <div
              key={area.id}
              className={`rounded-xl border overflow-hidden ${isDark ? 'bg-slate-700/30 border-slate-600' : 'bg-white border-slate-200 shadow-sm'}`}
            >
              {/* Area header */}
              <div
                className="px-4 py-3 flex items-center justify-between"
                style={{ backgroundColor: `${area.color}20` }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: area.color }} />
                  <span className="font-semibold text-sm" style={{ color: area.color }}>
                    {area.name}
                  </span>
                </div>
                {area.overallProgress > 0 && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${area.overallProgress >= 70 ? 'bg-green-500/20 text-green-500' :
                    area.overallProgress >= 40 ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-red-400/20 text-red-400'
                    }`}>
                    {area.overallProgress}%
                  </span>
                )}
              </div>

              {/* Per-month goals */}
              <div className="p-3 space-y-2">
                {area.monthGoals.map(({ month, key, goal, progress }) => (
                  <div key={month}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                        {MONTH_NAMES[month]}
                      </span>
                      {progress > 0 && (
                        <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{progress}%</span>
                      )}
                    </div>
                    {goal.objective ? (
                      <div className={`text-xs mb-1 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                        <NavIcon id="goals" size="w-3.5 h-3.5" /> {goal.objective}
                      </div>
                    ) : (
                      <div className={`text-xs italic mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        Chưa đặt mục tiêu
                      </div>
                    )}
                    {/* Tasks */}
                    {goal.subGoals.length > 0 && (
                      <div className="ml-2 space-y-0.5">
                        {goal.subGoals.map(sg => sg.tasks.map(task => (
                          <label
                            key={task.id}
                            className="flex items-center gap-1.5 cursor-pointer hover:opacity-80"
                          >
                            <input
                              type="checkbox"
                              checked={task.done}
                              onChange={() => toggleTask(key, area.id, sg.id, task.id)}
                              className="w-3.5 h-3.5 rounded border-slate-400 text-green-500 focus:ring-green-500"
                            />
                            <span className={`text-xs ${task.done ? 'line-through opacity-50' : ''} ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                              {task.text}
                            </span>
                          </label>
                        )))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Progress bar */}
                {area.totalTasks > 0 && (
                  <div className={`w-full h-1.5 rounded-full mt-2 ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`}>
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${area.overallProgress}%`, backgroundColor: area.color }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
