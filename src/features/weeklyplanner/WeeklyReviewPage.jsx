import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import WeeklyReflection from './WeeklyReflection'
import { toDateStr, getMonday } from './useWeeklyPlanner'

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

export default function WeeklyReviewPage({ weeklyPlannerHook, isDark }) {
  const navigate = useNavigate()
  const {
    currentWeekStart,
    savingStatus,
    getReflection,
    saveReflection,
    getWeekProgress,
    goToPrevWeek,
    goToNextWeek,
    goToCurrentWeek,
  } = weeklyPlannerHook

  const reflection = getReflection(currentWeekStart)
  const progress = getWeekProgress(currentWeekStart)
  const weekRange = formatWeekRange(currentWeekStart)
  const isCurrent = isCurrentWeek(currentWeekStart)

  const textMain = isDark ? 'text-slate-100' : 'text-slate-800'
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500'

  return (
    <div className="max-w-2xl mx-auto">
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
          <span className="text-3xl">🪞</span>
          <div>
            <h1 className={`text-2xl font-bold ${textMain}`}>Review Tuần</h1>
            <p className={`text-sm italic ${textMuted}`}>Nhìn lại để tiến xa hơn</p>
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

      {/* ── Progress Bar (tasks của tuần) ── */}
      {progress.total > 0 && (
        <div className={`flex items-center gap-3 mb-6 px-4 py-3 rounded-xl border ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
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
      )}

      {/* ── Reflection Form ── */}
      <WeeklyReflection
        weekStart={currentWeekStart}
        reflection={reflection}
        onSave={(key, value) => saveReflection(currentWeekStart, key, value)}
        isDark={isDark}
      />

      <div className="h-8" />
    </div>
  )
}
