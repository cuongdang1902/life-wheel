import { useState, useMemo } from 'react'
import { THIS_YEAR_QUESTIONS, NEXT_YEAR_QUESTIONS, CATEGORIES, TOTAL_QUESTIONS } from '../yearreview/questions'
import QuestionCard from '../yearreview/QuestionCard'

const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 21 }, (_, i) => 2025 + i) // 2025 → 2045

const SECTION_TABS = [
  { id: 'this_year', label: 'Năm nay', icon: '🪞', count: 30 },
  { id: 'next_year', label: 'Năm tới', icon: '🚀', count: 20 },
]

const THIS_YEAR_CATS = [
  CATEGORIES.HIGHLIGHTS,
  CATEGORIES.LESSONS,
  CATEGORIES.CHALLENGES,
  CATEGORIES.GROWTH,
  CATEGORIES.RELATIONSHIPS,
  CATEGORIES.REFLECTION,
]

function ProgressRing({ answered, total, size = 64, stroke = 5, color = '#6366f1' }) {
  const r = (size - stroke * 2) / 2
  const circ = 2 * Math.PI * r
  const pct = total > 0 ? answered / total : 0
  const dash = pct * circ
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeOpacity={0.15} strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.5s ease' }}
      />
    </svg>
  )
}

export default function YearReviewPage({ isDark, useYearReviewHook }) {
  const { getReview, saveAnswer, getProgress, savingStatus, loading } = useYearReviewHook

  const defaultYear = YEAR_OPTIONS.includes(CURRENT_YEAR) ? CURRENT_YEAR : 2025
  const [selectedYear, setSelectedYear] = useState(defaultYear)
  const [activeSection, setActiveSection] = useState('this_year')
  const [activeCat, setActiveCat] = useState('all')

  const review = getReview(selectedYear)
  const answers = review.answers || {}

  const allProgress = getProgress(selectedYear, 'all')
  const sectionProgress = getProgress(selectedYear, activeSection)

  const visibleQuestions = useMemo(() => {
    const base = activeSection === 'this_year' ? THIS_YEAR_QUESTIONS : NEXT_YEAR_QUESTIONS
    if (activeCat === 'all') return base
    return base.filter(q => q.category.id === activeCat)
  }, [activeSection, activeCat])

  const handleSave = (questionId, text) => {
    saveAnswer(selectedYear, questionId, text)
  }

  const allDone = allProgress.answered === TOTAL_QUESTIONS
  const thisYearPct = Math.round((getProgress(selectedYear, 'this_year').answered / 30) * 100)
  const nextYearPct = Math.round((getProgress(selectedYear, 'next_year').answered / 20) * 100)

  const catOptions = activeSection === 'this_year' ? THIS_YEAR_CATS : [CATEGORIES.NEXT_YEAR]

  return (
    <div className="max-w-3xl mx-auto">

      {/* ── Tiêu đề trang ── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">📖</span>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Nhìn Lại Năm Cũ
            </h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              50 câu hỏi sâu sắc để phản tư và đặt ý định cho năm mới
            </p>
          </div>
        </div>
      </div>

      {/* ── Chọn năm (dropdown) ── */}
      <div className="flex items-center gap-3 mb-6">
        <label className={`text-sm font-medium shrink-0 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          📅 Năm review:
        </label>
        <select
          value={selectedYear}
          onChange={e => { setSelectedYear(Number(e.target.value)); setActiveCat('all') }}
          className={`px-4 py-2 rounded-xl text-sm font-semibold border outline-none cursor-pointer transition-colors
            ${isDark
              ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-indigo-500'
              : 'bg-white border-slate-200 text-slate-800 focus:border-indigo-400 shadow-sm'
            }`}
        >
          {YEAR_OPTIONS.map(year => (
            <option key={year} value={year}>
              {year} {year === CURRENT_YEAR ? '(Hiện tại)' : year < CURRENT_YEAR ? '(Nhìn lại)' : '(Tương lai)'}
            </option>
          ))}
        </select>
      </div>

      {/* ── Thẻ tiến độ tổng thể ── */}
      <div className={`relative rounded-2xl p-5 mb-6 overflow-hidden border
        ${allDone
          ? isDark ? 'bg-gradient-to-r from-indigo-900/60 to-purple-900/60 border-indigo-500/40' : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200'
          : isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200'
        }`}
      >
        {allDone && (
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 pointer-events-none" />
        )}

        <div className="flex items-center gap-5">
          {/* Vòng tròn tiến độ */}
          <div className="relative flex-shrink-0">
            <ProgressRing
              answered={allProgress.answered}
              total={TOTAL_QUESTIONS}
              size={72}
              stroke={6}
              color={allDone ? '#a855f7' : '#6366f1'}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                {allDone ? '🏆' : `${Math.round((allProgress.answered / TOTAL_QUESTIONS) * 100)}%`}
              </span>
            </div>
          </div>

          <div className="flex-1">
            {allDone ? (
              <>
                <p className={`text-base font-bold mb-0.5 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                  🎉 Hoàn thành review!
                </p>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Bạn đã trả lời cả 50 câu hỏi cho năm {selectedYear}. Tuyệt vời!
                </p>
              </>
            ) : (
              <>
                <p className={`text-base font-bold mb-0.5 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                  {allProgress.answered} / {TOTAL_QUESTIONS} câu đã trả lời
                </p>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {allProgress.answered === 0
                    ? `Bắt đầu review năm ${selectedYear} — từng câu một thôi.`
                    : `Tiếp tục nhé! Còn ${TOTAL_QUESTIONS - allProgress.answered} câu nữa là hoàn thành review năm ${selectedYear}.`
                  }
                </p>
              </>
            )}

            {/* Thanh mini: Năm nay / Năm tới */}
            <div className="flex gap-4 mt-3">
              {[
                { label: 'Năm nay', pct: thisYearPct, color: '#6366f1' },
                { label: 'Năm tới', pct: nextYearPct, color: '#0ea5e9' },
              ].map(({ label, pct, color }) => (
                <div key={label} className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</span>
                    <span className="text-xs font-semibold" style={{ color }}>{pct}%</span>
                  </div>
                  <div className={`h-1.5 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trạng thái lưu */}
          <div className="flex-shrink-0 text-right">
            {savingStatus === 'saving' && (
              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>💾 Đang lưu...</span>
            )}
            {savingStatus === 'saved' && (
              <span className="text-xs text-emerald-500">✓ Đã lưu</span>
            )}
            {savingStatus === 'error' && (
              <span className="text-xs text-red-400">✗ Lỗi lưu</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Tab phần ── */}
      <div className="flex gap-3 mb-5">
        {SECTION_TABS.map(tab => {
          const prog = getProgress(selectedYear, tab.id)
          const isActive = activeSection === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveSection(tab.id); setActiveCat('all') }}
              className={`flex-1 flex items-center justify-between px-4 py-3 rounded-xl border font-medium transition-all duration-200
                ${isActive
                  ? isDark
                    ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300'
                    : 'border-indigo-400 bg-indigo-50 text-indigo-700'
                  : isDark
                    ? 'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-600'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                }`}
            >
              <span className="flex items-center gap-2 text-sm">
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-normal ${isActive ? isDark ? 'bg-indigo-500/30 text-indigo-300' : 'bg-indigo-100 text-indigo-600' : isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                  {tab.count} câu
                </span>
              </span>
              <span className={`text-xs font-bold ${prog.answered === prog.total ? 'text-emerald-500' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {prog.answered}/{prog.total}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Lọc theo chủ đề (chỉ cho phần Năm nay) ── */}
      {activeSection === 'this_year' && (
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setActiveCat('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
              ${activeCat === 'all'
                ? isDark ? 'bg-slate-600 border-slate-500 text-white' : 'bg-slate-800 border-slate-800 text-white'
                : isDark ? 'border-slate-700 text-slate-400 hover:border-slate-600' : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white'
              }`}
          >
            Tất cả
          </button>
          {catOptions.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                ${activeCat === cat.id
                  ? 'text-white border-transparent'
                  : isDark ? 'border-slate-700 text-slate-400 hover:border-slate-600' : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white'
                }`}
              style={activeCat === cat.id ? { backgroundColor: cat.color } : {}}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Thanh tiến độ phần hiện tại ── */}
      <div className="flex items-center gap-3 mb-5">
        <div className={`flex-1 h-1.5 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${sectionProgress.total > 0 ? (sectionProgress.answered / sectionProgress.total) * 100 : 0}%`,
              backgroundColor: activeSection === 'this_year' ? '#6366f1' : '#0ea5e9'
            }}
          />
        </div>
        <span className={`text-xs font-medium shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {sectionProgress.answered}/{visibleQuestions.length} câu hiển thị
        </span>
      </div>

      {/* ── Danh sách câu hỏi ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Đang tải review của bạn...</p>
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
