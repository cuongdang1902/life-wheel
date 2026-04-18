import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MONTHLY_QUESTIONS, MONTHLY_CATEGORIES, TOTAL_MONTHLY_QUESTIONS } from './monthlyQuestions'
import QuestionCard from '../yearreview/QuestionCard'

const CURRENT_YEAR = new Date().getFullYear()
const CURRENT_MONTH = new Date().getMonth() + 1
const YEAR_OPTIONS = Array.from({ length: 11 }, (_, i) => 2024 + i)
const MONTH_NAMES = [
  '', 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
]

const CAT_LIST = [
  MONTHLY_CATEGORIES.LOOKBACK,
  MONTHLY_CATEGORIES.EVALUATE,
  MONTHLY_CATEGORIES.NEXTMONTH,
]

function ProgressRing({ answered, total, size = 60, stroke = 5, color = '#6366f1' }) {
  const r = (size - stroke * 2) / 2
  const circ = 2 * Math.PI * r
  const dash = total > 0 ? (answered / total) * circ : 0
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeOpacity={0.15} strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.5s ease' }}
      />
    </svg>
  )
}

export default function MonthlyReviewPage({ isDark, monthlyReviewHook }) {
  const navigate = useNavigate()
  const { getReview, saveAnswer, getProgress, savingStatus, loading } = monthlyReviewHook

  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR)
  const [selectedMonth, setSelectedMonth] = useState(CURRENT_MONTH)
  const [activeCat, setActiveCat] = useState('all')

  const review = getReview(selectedYear, selectedMonth)
  const answers = review.answers || {}
  const progress = getProgress(selectedYear, selectedMonth)
  const allDone = progress.answered === TOTAL_MONTHLY_QUESTIONS
  const pct = Math.round((progress.answered / TOTAL_MONTHLY_QUESTIONS) * 100)

  const visibleQuestions = useMemo(() => {
    if (activeCat === 'all') return MONTHLY_QUESTIONS
    return MONTHLY_QUESTIONS.filter(q => q.category.id === activeCat)
  }, [activeCat])

  const handleSave = (questionId, text) => saveAnswer(selectedYear, selectedMonth, questionId, text)

  const textMain = isDark ? 'text-white' : 'text-slate-900'
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500'

  return (
    <div className="max-w-3xl mx-auto">

      {/* ── Header ── */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/review')}
          className={`flex items-center gap-1.5 text-sm mb-4 transition-colors cursor-pointer ${
            isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          ← Review Hub
        </button>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">📆</span>
          <div>
            <h1 className={`text-2xl font-bold ${textMain}`}>Review Tháng</h1>
            <p className={`text-sm ${textMuted}`}>15 câu hỏi phản tư để đánh giá tháng vừa qua</p>
          </div>
        </div>
      </div>

      {/* ── Month + Year Selector ── */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <label className={`text-sm font-medium shrink-0 ${textMuted}`}>📅 Chọn tháng:</label>
        <select
          value={selectedMonth}
          onChange={e => { setSelectedMonth(Number(e.target.value)); setActiveCat('all') }}
          className={`px-3 py-2 rounded-xl text-sm font-semibold border outline-none cursor-pointer transition-colors ${isDark
            ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-indigo-500'
            : 'bg-white border-slate-200 text-slate-800 focus:border-indigo-400 shadow-sm'
          }`}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
            <option key={m} value={m}>
              {MONTH_NAMES[m]} {m === CURRENT_MONTH ? '(Hiện tại)' : ''}
            </option>
          ))}
        </select>
        <select
          value={selectedYear}
          onChange={e => { setSelectedYear(Number(e.target.value)); setActiveCat('all') }}
          className={`px-3 py-2 rounded-xl text-sm font-semibold border outline-none cursor-pointer transition-colors ${isDark
            ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-indigo-500'
            : 'bg-white border-slate-200 text-slate-800 focus:border-indigo-400 shadow-sm'
          }`}
        >
          {YEAR_OPTIONS.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* ── Progress Card ── */}
      <div className={`relative rounded-2xl p-5 mb-6 overflow-hidden border ${allDone
        ? isDark ? 'bg-gradient-to-r from-indigo-900/60 to-purple-900/60 border-indigo-500/40' : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200'
        : isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <ProgressRing answered={progress.answered} total={TOTAL_MONTHLY_QUESTIONS} color={allDone ? '#a855f7' : '#6366f1'} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-xs font-bold ${textMain}`}>
                {allDone ? '🏆' : `${pct}%`}
              </span>
            </div>
          </div>
          <div className="flex-1">
            {allDone ? (
              <>
                <p className={`text-base font-bold mb-0.5 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>🎉 Hoàn thành review!</p>
                <p className={`text-sm ${textMuted}`}>Đã trả lời cả 15 câu cho {MONTH_NAMES[selectedMonth]}/{selectedYear}</p>
              </>
            ) : (
              <>
                <p className={`text-base font-bold mb-0.5 ${textMain}`}>{progress.answered}/{TOTAL_MONTHLY_QUESTIONS} câu đã trả lời</p>
                <p className={`text-sm ${textMuted}`}>
                  {progress.answered === 0
                    ? `Bắt đầu review ${MONTH_NAMES[selectedMonth]}/${selectedYear}`
                    : `Còn ${TOTAL_MONTHLY_QUESTIONS - progress.answered} câu nữa`
                  }
                </p>
              </>
            )}
          </div>
          <div className="flex-shrink-0">
            {savingStatus === 'saving' && <span className={`text-xs ${textMuted}`}>💾 Đang lưu...</span>}
            {savingStatus === 'saved' && <span className="text-xs text-emerald-500">✓ Đã lưu</span>}
            {savingStatus === 'error' && <span className="text-xs text-red-400">✗ Lỗi</span>}
          </div>
        </div>
      </div>

      {/* ── Category Filter ── */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setActiveCat('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${activeCat === 'all'
            ? isDark ? 'bg-slate-600 border-slate-500 text-white' : 'bg-slate-800 border-slate-800 text-white'
            : isDark ? 'border-slate-700 text-slate-400 hover:border-slate-600' : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white'
          }`}
        >
          Tất cả
        </button>
        {CAT_LIST.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCat(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${activeCat === cat.id
              ? 'text-white border-transparent'
              : isDark ? 'border-slate-700 text-slate-400 hover:border-slate-600' : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white'
            }`}
            style={activeCat === cat.id ? { backgroundColor: cat.color } : {}}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* ── Progress bar section ── */}
      <div className="flex items-center gap-3 mb-5">
        <div className={`flex-1 h-1.5 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: '#6366f1' }}
          />
        </div>
        <span className={`text-xs font-medium shrink-0 ${textMuted}`}>
          {visibleQuestions.filter(q => answers[q.id]?.trim()).length}/{visibleQuestions.length} hiển thị
        </span>
      </div>

      {/* ── Questions ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className={`text-sm ${textMuted}`}>Đang tải...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleQuestions.map(q => (
            <QuestionCard
              key={q.id}
              question={q}
              answer={answers[q.id] || ''}
              onSave={handleSave}
              isDark={isDark}
            />
          ))}
        </div>
      )}
      <div className="h-12" />
    </div>
  )
}
