import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { RoleRow } from './WeeklyPlannerComponents'

const DAY_LABELS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN']

function getDayDate(weekStart, dayIndex) {
  const d = new Date(weekStart + 'T00:00:00')
  d.setDate(d.getDate() + dayIndex)
  return d
}

function formatDayHeader(date) {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`
}

function isToday(date) {
  const now = new Date()
  return date.toDateString() === now.toDateString()
}

function formatWeekRange(weekStart) {
  const start = new Date(weekStart + 'T00:00:00')
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const fmt = d => `${d.getDate()}/${d.getMonth() + 1}`
  return `${fmt(start)} – ${fmt(end)}`
}

function isCurrentWeek(weekStart) {
  const now = new Date()
  const start = new Date(weekStart + 'T00:00:00')
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  return now >= start && now <= end
}

export default function WeeklyPlannerPage({
  weeklyPlannerHook,
  isDark,
}) {
  const navigate = useNavigate()
  const {
    currentWeekStart,
    loading,
    savingStatus,
    getRoles,
    addRole,
    updateRole,
    deleteRole,
    toggleStar,
    getTasks,
    addTask,
    deleteTask,
    toggleTask,
    getWeekProgress,
    goToPrevWeek,
    goToNextWeek,
    goToCurrentWeek,
  } = weeklyPlannerHook

  const roles = getRoles(currentWeekStart)
  const progress = getWeekProgress(currentWeekStart)
  const weekRange = formatWeekRange(currentWeekStart)
  const isCurrent = isCurrentWeek(currentWeekStart)

  const dayDates = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => getDayDate(currentWeekStart, i)),
    [currentWeekStart]
  )

  const headerBg = isDark ? 'bg-slate-700/60' : 'bg-slate-100'
  const borderColor = isDark ? 'border-slate-700/60' : 'border-slate-200'
  const textMain = isDark ? 'text-slate-100' : 'text-slate-800'
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500'

  return (
    <div className="max-w-full">
      {/* ── Page Header ── */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/review')}
          className={`flex items-center gap-1.5 text-sm mb-4 transition-colors cursor-pointer ${
            isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          ← Review Hub
        </button>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl">📅</span>
          <div>
            <h1 className={`text-2xl font-bold ${textMain}`}>Weekly Planner</h1>
            <p className={`text-sm italic ${textMuted}`}>Ưu tiên việc quan trọng</p>
          </div>
        </div>
      </div>

      {/* ── Week Selector ── */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
          <button
            onClick={goToPrevWeek}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
          >‹</button>
          <div className="flex items-center gap-2">
            <span className="text-sm">📆</span>
            <span className={`text-sm font-semibold ${textMain}`}>
              Tuần: {weekRange}
            </span>
            {isCurrent && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-medium">
                Hiện tại
              </span>
            )}
          </div>
          <button
            onClick={goToNextWeek}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
          >›</button>
        </div>

        {!isCurrent && (
          <button
            onClick={goToCurrentWeek}
            className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors cursor-pointer ${isDark
              ? 'border-slate-700 text-slate-400 hover:border-indigo-500 hover:text-indigo-400'
              : 'border-slate-200 text-slate-500 hover:border-indigo-400 hover:text-indigo-600'
            }`}
          >
            Tuần này
          </button>
        )}

        {/* Saving status */}
        <div className="ml-auto flex items-center gap-2">
          {savingStatus === 'saving' && <span className={`text-xs ${textMuted}`}>💾 Đang lưu...</span>}
          {savingStatus === 'saved' && <span className="text-xs text-emerald-500">✓ Đã lưu</span>}
          {savingStatus === 'error' && <span className="text-xs text-red-400">✗ Lỗi lưu</span>}
        </div>
      </div>

      {/* ── Progress Bar ── */}
      <div className={`flex items-center gap-3 mb-5 px-4 py-3 rounded-xl border ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className={`flex-1 h-2 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
          <div
            className="h-full rounded-full bg-indigo-500 transition-all duration-500"
            style={{ width: `${progress.pct}%` }}
          />
        </div>
        <span className={`text-sm font-medium shrink-0 ${textMuted}`}>
          {progress.done}/{progress.total} tasks hoàn thành
          <span className="ml-2 font-bold" style={{ color: progress.pct > 0 ? '#6366f1' : undefined }}>
            {progress.pct}%
          </span>
        </span>
      </div>

      {/* ── Main Table ── */}
      <div className="min-w-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className={`text-sm ${textMuted}`}>Đang tải...</p>
              </div>
            </div>
          ) : (
            <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-slate-700' : 'border-slate-200 shadow-sm'}`}>
              {/* Horizontal scroll wrapper */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse" style={{ minWidth: '900px' }}>
                  {/* Table header */}
                  <thead>
                    <tr className={`border-b ${borderColor} ${headerBg}`}>
                      <th className={`w-8 px-2 py-3 border-r ${borderColor}`}></th>
                      <th className={`px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide border-r ${borderColor} w-48 ${textMuted}`}>
                        Mục tiêu tuần
                      </th>
                      {dayDates.map((date, i) => {
                        const todayHighlight = isToday(date)
                        return (
                          <th
                            key={i}
                            className={`px-2 py-3 text-center text-xs font-semibold border-r ${borderColor} min-w-[120px] ${todayHighlight
                              ? 'text-indigo-400'
                              : textMuted
                            }`}
                          >
                            <div>{DAY_LABELS[i]}</div>
                            <div className={`text-xs font-normal mt-0.5 ${todayHighlight ? 'text-indigo-300' : ''}`}>
                              ({formatDayHeader(date)})
                            </div>
                            {todayHighlight && (
                              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mx-auto mt-1" />
                            )}
                          </th>
                        )
                      })}
                    </tr>
                  </thead>

                  {/* Table body */}
                  <tbody>
                    {roles.map((role, index) => (
                      <RoleRow
                        key={role.id}
                        role={role}
                        index={index}
                        weekStart={currentWeekStart}
                        isDark={isDark}
                        onUpdateRole={(roleId, changes) => updateRole(currentWeekStart, roleId, changes)}
                        onDeleteRole={(roleId) => deleteRole(currentWeekStart, roleId)}
                        onToggleStar={(roleId) => toggleStar(currentWeekStart, roleId)}
                        getTasks={(ws, roleId, dayIndex) => getTasks(ws, roleId, dayIndex)}
                        onAddTask={(roleId, dayIndex, text) => addTask(currentWeekStart, roleId, dayIndex, text)}
                        onToggleTask={(roleId, dayIndex, taskId) => toggleTask(currentWeekStart, roleId, dayIndex, taskId)}
                        onDeleteTask={(roleId, dayIndex, taskId) => deleteTask(currentWeekStart, roleId, dayIndex, taskId)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add role button */}
              <div className={`px-4 py-3 border-t ${borderColor} ${isDark ? 'bg-slate-800/40' : 'bg-slate-50'}`}>
                <button
                  onClick={() => addRole(currentWeekStart)}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer ${isDark
                    ? 'text-slate-400 hover:text-indigo-400'
                    : 'text-slate-500 hover:text-indigo-600'
                  }`}
                >
                  <span className="text-lg">+</span>
                  Thêm hàng
                </button>
              </div>
            </div>
          )}
      </div>

      <div className="h-8" />
    </div>
  )
}
