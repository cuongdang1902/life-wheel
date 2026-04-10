import { useNavigate } from 'react-router-dom'

const CURRENT_YEAR = new Date().getFullYear()
const CURRENT_MONTH = new Date().getMonth() + 1
const CURRENT_QUARTER = Math.ceil(CURRENT_MONTH / 3)

function formatWeekRange(weekStart) {
  if (!weekStart) return 'Tuần này'
  const start = new Date(weekStart + 'T00:00:00')
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const fmt = d => `${d.getDate()}/${d.getMonth() + 1}`
  return `${fmt(start)} – ${fmt(end)}`
}

const MONTH_NAMES = [
  '', 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
]

function ProgressBar({ answered, total, color = '#6366f1', isDark }) {
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0
  return (
    <div>
      <div className={`h-1.5 rounded-full mb-1 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
        {answered}/{total} {pct > 0 ? `— ${pct}%` : ''}
      </p>
    </div>
  )
}

function ReviewCard({ icon, title, description, route, color, progress, badge, isDark, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`group relative rounded-2xl border p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg overflow-hidden ${isDark
        ? 'bg-slate-800/60 border-slate-700 hover:border-indigo-500/50'
        : 'bg-white border-slate-200 hover:border-indigo-300 shadow-sm'
      }`}
    >
      {/* Gradient accent top */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl transition-opacity duration-300 opacity-60 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }}
      />

      {/* Badge */}
      {badge && (
        <div className="absolute top-3 right-3">
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: color }}
          >
            {badge}
          </span>
        </div>
      )}

      {/* Icon + Title */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: `${color}20` }}
        >
          {icon}
        </div>
        <div>
          <h3 className={`font-bold text-lg leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {title}
          </h3>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {description}
          </p>
        </div>
      </div>

      {/* Progress */}
      {progress && (
        <div className="mt-4">
          <ProgressBar
            answered={progress.answered}
            total={progress.total}
            color={color}
            isDark={isDark}
          />
        </div>
      )}

      {/* Arrow */}
      <div className={`absolute bottom-4 right-4 text-sm transition-transform duration-300 group-hover:translate-x-1 ${isDark ? 'text-slate-600 group-hover:text-indigo-400' : 'text-slate-300 group-hover:text-indigo-500'}`}>
        →
      </div>
    </div>
  )
}

export default function ReviewHubPage({
  isDark,
  weeklyPlannerHook,
  monthlyReviewHook,
  quarterlyReviewHook,
  yearReviewHook,
}) {
  const navigate = useNavigate()

  // Progress data
  const weekProgress = weeklyPlannerHook?.getWeekProgress?.(weeklyPlannerHook.currentWeekStart) || { done: 0, total: 0 }
  const weekRange = formatWeekRange(weeklyPlannerHook?.currentWeekStart)

  const monthProgress = monthlyReviewHook?.getProgress?.(CURRENT_YEAR, CURRENT_MONTH) || { answered: 0, total: 15 }
  const quarterProgress = quarterlyReviewHook?.getProgress?.(CURRENT_YEAR, CURRENT_QUARTER) || { answered: 0, total: 20 }
  const yearProgress = yearReviewHook?.getProgress?.(CURRENT_YEAR, 'all') || { answered: 0, total: 50 }

  const textMain = isDark ? 'text-white' : 'text-slate-900'
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500'

  const cards = [
    {
      icon: '📅',
      title: 'Weekly Planner',
      description: `Lên kế hoạch & phản tư theo tuần • ${weekRange}`,
      route: '/review/weekly',
      color: '#6366f1',
      progress: { answered: weekProgress.done, total: Math.max(weekProgress.total, 1) },
      badge: null,
    },
    {
      icon: '📆',
      title: 'Review Tháng',
      description: `Nhìn lại ${MONTH_NAMES[CURRENT_MONTH]}/${CURRENT_YEAR} • 15 câu hỏi`,
      route: '/review/monthly',
      color: '#10b981',
      progress: monthProgress,
      badge: null,
    },
    {
      icon: '📊',
      title: 'Review Quý',
      description: `Đánh giá Quý ${CURRENT_QUARTER}/${CURRENT_YEAR} • 20 câu hỏi`,
      route: '/review/quarterly',
      color: '#f59e0b',
      progress: quarterProgress,
      badge: null,
    },
    {
      icon: '📖',
      title: 'Review Năm',
      description: `Phản tư sâu năm ${CURRENT_YEAR} • 50 câu hỏi`,
      route: '/review/yearly',
      color: '#8b5cf6',
      progress: yearProgress,
      badge: null,
    },
  ]

  return (
    <div className="max-w-3xl mx-auto">

      {/* ── Header ── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">📝</span>
          <div>
            <h1 className={`text-2xl font-bold ${textMain}`}>Review Hub</h1>
            <p className={`text-sm ${textMuted}`}>
              Theo dõi tiến độ và phản tư ở mọi cấp độ thời gian
            </p>
          </div>
        </div>
      </div>

      {/* ── Summary Stats ── */}
      <div className={`rounded-2xl border p-5 mb-8 ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
        <p className={`text-xs font-semibold uppercase tracking-wide mb-4 ${textMuted}`}>Tiến độ tổng quan</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Weekly', value: weekProgress.total > 0 ? `${weekProgress.done}/${weekProgress.total}` : '—', color: '#6366f1', sub: 'tasks' },
            { label: 'Tháng này', value: `${monthProgress.answered}/15`, color: '#10b981', sub: 'câu' },
            { label: 'Quý này', value: `${quarterProgress.answered}/20`, color: '#f59e0b', sub: 'câu' },
            { label: 'Năm nay', value: `${yearProgress.answered}/50`, color: '#8b5cf6', sub: 'câu' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <p className={`text-2xl font-bold`} style={{ color: stat.color }}>{stat.value}</p>
              <p className={`text-xs ${textMuted}`}>{stat.label}</p>
              <p className={`text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map(card => (
          <ReviewCard
            key={card.route}
            {...card}
            isDark={isDark}
            onClick={() => navigate(card.route)}
          />
        ))}
      </div>

      <div className="h-12" />
    </div>
  )
}
