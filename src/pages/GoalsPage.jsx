import { useState, useMemo, Fragment } from 'react'
import { AREAS } from '../features/wheel/LifeWheel'
import ReviewStatus from '../features/goals/ReviewStatus'
import ReviewPanel from '../features/goals/ReviewPanel'

// Helpers để tạo period key
const currentDate = new Date()
const currentYear = currentDate.getFullYear()
const currentMonth = currentDate.getMonth() + 1 // 1-12
const currentQuarter = Math.ceil(currentMonth / 3)

const YEARS = Array.from({ length: 31 }, (_, i) => currentYear - 10 + i) // 10 năm quá khứ + hiện tại + 20 năm tương lai
const QUARTERS = [1, 2, 3, 4]
const MONTHS_IN_QUARTER = {
  1: [1, 2, 3],
  2: [4, 5, 6],
  3: [7, 8, 9],
  4: [10, 11, 12],
}
const MONTH_NAMES = [
  '', 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
]

// Period keys
const yearKey = (y) => `${y}`
const quarterKey = (y, q) => `${y}-Q${q}`
const monthKey = (y, m) => `${y}-${String(m).padStart(2, '0')}`

export default function GoalsPage({
  goals,
  getGoal,
  updateObjective,
  updateReview,
  updateSubGoalReview,
  updateTaskNote,
  addSubGoal,
  updateSubGoal,
  deleteSubGoal,
  addTask,
  updateTask,
  deleteTask,
  toggleTask,
  getProgress,
  clearGoal,
  isDark = true,
}) {
  // State: level & selections
  const [viewLevel, setViewLevel] = useState('month') // 'year' | 'quarter' | 'month'
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [selectedQuarter, setSelectedQuarter] = useState(currentQuarter)
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [selectedArea, setSelectedArea] = useState('health')

  // Sub-goal & task input state
  const [newSubGoalTitle, setNewSubGoalTitle] = useState('')
  const [newTaskTexts, setNewTaskTexts] = useState({})
  const [editingObjective, setEditingObjective] = useState(false)
  const [objectiveInput, setObjectiveInput] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)
  const [copiedKey, setCopiedKey] = useState(null)
  // Review states
  const [showReview, setShowReview] = useState(false)           // review panel của objective chính
  const [showSubGoalReview, setShowSubGoalReview] = useState(null) // id sub-goal đang mở review
  const [editingTaskNote, setEditingTaskNote] = useState(null)  // id task đang nhập note

  // Computed period key
  const periodKey = useMemo(() => {
    if (viewLevel === 'year') return yearKey(selectedYear)
    if (viewLevel === 'quarter') return quarterKey(selectedYear, selectedQuarter)
    return monthKey(selectedYear, selectedMonth)
  }, [viewLevel, selectedYear, selectedQuarter, selectedMonth])

  const currentGoal = getGoal(periodKey, selectedArea)
  const progress = getProgress(periodKey, selectedArea)
  const currentArea = AREAS.find(a => a.id === selectedArea)

  // Reset toàn bộ input khi đổi context (area / period)
  // Gọi đồng bộ trong handler thay vì useEffect để tránh render nhầm dữ liệu
  const resetInputs = () => {
    setEditingObjective(false)
    setObjectiveInput('')
    setNewSubGoalTitle('')
    setNewTaskTexts({})
    setConfirmClear(false)
    setShowReview(false)
    setShowSubGoalReview(null)
    setEditingTaskNote(null)
  }

  // Khi chuyển quý, sync tháng vào quý đó
  const handleQuarterChange = (q) => {
    resetInputs()
    setSelectedQuarter(q)
    const monthsInQ = MONTHS_IN_QUARTER[q]
    if (!monthsInQ.includes(selectedMonth)) {
      setSelectedMonth(monthsInQ[0])
    }
  }

  // Objective editing
  const handleStartEditObjective = () => {
    setObjectiveInput(currentGoal.objective)
    setEditingObjective(true)
  }
  const handleSaveObjective = () => {
    updateObjective(periodKey, selectedArea, objectiveInput)
    setEditingObjective(false)
  }
  const handleClearGoal = () => {
    if (!confirmClear) { setConfirmClear(true); return }
    clearGoal(periodKey, selectedArea)
    setConfirmClear(false)
    setEditingObjective(false)
    setObjectiveInput('')
  }

  // Review handlers
  const handleSaveReview = (review) => {
    updateReview(periodKey, selectedArea, review)
    setShowReview(false)
  }
  const handleSaveSubGoalReview = (subGoalId, review) => {
    updateSubGoalReview(periodKey, selectedArea, subGoalId, review)
    setShowSubGoalReview(null)
  }
  const handleSaveTaskNote = (subGoalId, taskId, note) => {
    updateTaskNote(periodKey, selectedArea, subGoalId, taskId, note)
    setEditingTaskNote(null)
  }

  // Copy objective vào clipboard, hiện checkmark trong 2 giây
  const handleCopy = (text, key, e) => {
    e?.stopPropagation()
    if (!text) return
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 2000)
    })
  }

  // SVG icons
  const IconCopy = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
  const IconCheck = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )

  // Sub-goal (chỉ ở cấp Tháng)
  const handleAddSubGoal = () => {
    if (!newSubGoalTitle.trim()) return
    if (addSubGoal(periodKey, selectedArea, newSubGoalTitle.trim())) {
      setNewSubGoalTitle('')
    }
  }
  const handleAddTask = (subGoalId) => {
    const text = newTaskTexts[subGoalId]
    if (!text?.trim()) return
    if (addTask(periodKey, selectedArea, subGoalId, text.trim())) {
      setNewTaskTexts(prev => ({ ...prev, [subGoalId]: '' }))
    }
  }

  // Label cho period hiện tại
  const periodLabel = useMemo(() => {
    if (viewLevel === 'year') return `Năm ${selectedYear}`
    if (viewLevel === 'quarter') return `Quý ${selectedQuarter}/${selectedYear}`
    return `${MONTH_NAMES[selectedMonth]}/${selectedYear}`
  }, [viewLevel, selectedYear, selectedQuarter, selectedMonth])

  // ---- RENDER ----
  return (
    <div className={`rounded-2xl w-full mx-auto max-w-3xl overflow-hidden border shadow-xl ${isDark
      ? 'bg-slate-800 border-slate-700'
      : 'bg-white border-slate-200'
      }`}>
      {/* Header */}
      <div className={`p-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
          🎯 Goals (OKR)
        </h2>
        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Đặt mục tiêu phân cấp: Năm → Quý → Tháng
        </p>
      </div>

      {/* Selectors */}
      <div className={`px-6 py-4 border-b space-y-3 ${isDark ? 'bg-slate-700/30 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
        {/* Row 1: Level tabs + Area */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Level tabs */}
          <div className={`flex rounded-lg overflow-hidden border ${isDark ? 'border-slate-600' : 'border-slate-300'}`}>
            {[
              { value: 'year', label: 'Năm' },
              { value: 'quarter', label: 'Quý' },
              { value: 'month', label: 'Tháng' },
            ].map(level => (
              <button
                key={level.value}
                onClick={() => { resetInputs(); setViewLevel(level.value) }}
                className={`px-4 py-2 text-sm font-medium transition-colors ${viewLevel === level.value
                  ? 'bg-indigo-600 text-white'
                  : isDark
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
              >
                {level.label}
              </button>
            ))}
          </div>

          {/* Area selector */}
          <select
            value={selectedArea}
            onChange={(e) => { resetInputs(); setSelectedArea(e.target.value) }}
            className={`px-4 py-2 rounded-lg text-sm font-medium border ${isDark
              ? 'bg-slate-600 text-white border-slate-500'
              : 'bg-white text-slate-700 border-slate-200'
              }`}
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
              <div className={`w-20 h-2 rounded-full ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`}>
                <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
              <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {progress}%
              </span>
            </div>
          )}
        </div>

        {/* Row 2: Period dropdowns */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Year dropdown */}
          <select
            value={selectedYear}
            onChange={(e) => { resetInputs(); setSelectedYear(Number(e.target.value)) }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${isDark
              ? 'bg-slate-600 text-white border-slate-500'
              : 'bg-white text-slate-700 border-slate-300'
              }`}
          >
            {YEARS.map(y => (
              <option key={y} value={y}>Năm {y}</option>
            ))}
          </select>

          {/* Quarter dropdown (visible when level is quarter or month) */}
          {(viewLevel === 'quarter' || viewLevel === 'month') && (
            <select
              value={selectedQuarter}
              onChange={(e) => handleQuarterChange(Number(e.target.value))}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${isDark
                ? 'bg-slate-600 text-white border-slate-500'
                : 'bg-white text-slate-700 border-slate-300'
                }`}
            >
              {QUARTERS.map(q => (
                <option key={q} value={q}>Quý {q}</option>
              ))}
            </select>
          )}

          {/* Month dropdown (visible only when level is month) */}
          {viewLevel === 'month' && (
            <select
              value={selectedMonth}
              onChange={(e) => { resetInputs(); setSelectedMonth(Number(e.target.value)) }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${isDark
                ? 'bg-slate-600 text-white border-slate-500'
                : 'bg-white text-slate-700 border-slate-300'
                }`}
            >
              {MONTHS_IN_QUARTER[selectedQuarter].map(m => (
                <option key={m} value={m}>{MONTH_NAMES[m]}</option>
              ))}
            </select>
          )}

          {/* Current period badge */}
          <span className={`ml-auto text-xs px-3 py-1 rounded-full ${isDark ? 'bg-indigo-600/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
            {periodLabel}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Objective (hiện ở mọi cấp) */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                🎯 Mục tiêu {viewLevel === 'year' ? 'Năm' : viewLevel === 'quarter' ? 'Quý' : 'Tháng'}
              </h3>
              {currentGoal.review && <ReviewStatus status={currentGoal.review.status} isDark={isDark} />}
            </div>
          <div className="flex items-center gap-2">
              {currentGoal.objective && !editingObjective && (
                <>
                  {/* Review button */}
                  <button
                    onClick={() => { setShowReview(v => !v); setEditingObjective(false) }}
                    title="Đánh giá kết quả"
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all ${
                      showReview
                        ? isDark ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700'
                        : isDark ? 'bg-slate-600 text-slate-400 hover:bg-indigo-600/30 hover:text-indigo-400' : 'bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
                    }`}
                  >
                    📝 Review
                  </button>
                  {/* Copy button */}
                  <button
                    onClick={(e) => handleCopy(currentGoal.objective, periodKey + selectedArea, e)}
                    title="Copy mục tiêu"
                    className={`flex items-center justify-center w-7 h-7 rounded-md transition-all ${
                      copiedKey === periodKey + selectedArea
                        ? isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-600'
                        : isDark ? 'bg-slate-600 text-slate-400 hover:bg-slate-500 hover:text-slate-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                    }`}
                  >
                    {copiedKey === periodKey + selectedArea ? <IconCheck /> : <IconCopy />}
                  </button>
                  {/* Delete button */}
                  <button
                    onClick={handleClearGoal}
                    onBlur={() => setConfirmClear(false)}
                    title="Xóa mục tiêu này"
                    className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                      confirmClear
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : isDark ? 'bg-slate-600 text-slate-400 hover:bg-red-500/30 hover:text-red-400' : 'bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500'
                    }`}
                  >
                    {confirmClear ? '⚠️ Xác nhận xóa?' : '🗑️'}
                  </button>
                </>
              )}
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: currentArea?.color }} />
            </div>
          </div>

          {editingObjective ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={objectiveInput}
                onChange={(e) => setObjectiveInput(e.target.value)}
                placeholder="Nhập mục tiêu..."
                className={`flex-1 px-4 py-2 rounded-lg border ${isDark
                  ? 'bg-slate-600 border-slate-500 text-white placeholder-slate-400'
                  : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
                  }`}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSaveObjective()}
              />
              <button onClick={handleSaveObjective} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">✓</button>
              <button onClick={() => setEditingObjective(false)} className={`px-4 py-2 rounded-lg ${isDark ? 'bg-slate-600 hover:bg-slate-500' : 'bg-slate-200 hover:bg-slate-300'}`}>✕</button>
            </div>
          ) : (
            <div
              onClick={handleStartEditObjective}
              className={`px-4 py-3 rounded-lg cursor-pointer transition-colors ${currentGoal.objective
                ? isDark ? 'bg-slate-600/50 hover:bg-slate-600/70' : 'bg-white hover:bg-slate-100'
                : isDark ? 'bg-slate-600/30 border-2 border-dashed border-slate-500' : 'bg-white/50 border-2 border-dashed border-slate-300'
                }`}
            >
              {currentGoal.objective ? (
                <p className={`text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>{currentGoal.objective}</p>
              ) : (
                <p className={isDark ? 'text-slate-400' : 'text-slate-400'}>+ Nhấn để thêm mục tiêu...</p>
              )}
            </div>
          )}
          {/* Review Panel cho objective chính */}
          {showReview && currentGoal.objective && (
            <ReviewPanel
              review={currentGoal.review}
              onSave={handleSaveReview}
              onCancel={() => setShowReview(false)}
              isDark={isDark}
            />
          )}
        </div>

        {/* ===== HIỂN THỊ THEO CẤP ===== */}

        {/* Cấp Năm: hiển thị danh sách 4 Quý */}
        {viewLevel === 'year' && (
          <div>
            <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              📋 Mục tiêu các Quý trong năm {selectedYear}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {QUARTERS.map(q => {
                const qKey = quarterKey(selectedYear, q)
                const qGoal = getGoal(qKey, selectedArea)
                const qProgress = getProgress(qKey, selectedArea)
                return (
                  <div
                    key={q}
                    onClick={() => { resetInputs(); setViewLevel('quarter'); setSelectedQuarter(q) }}
                    className={`group p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${isDark
                      ? 'bg-slate-700/30 border-slate-600 hover:border-indigo-500'
                      : 'bg-white border-slate-200 hover:border-indigo-400 shadow-sm'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                        Quý {q}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {qGoal.objective && (
                          <button
                            onClick={(e) => handleCopy(qGoal.objective, `q-${q}`, e)}
                            title="Copy mục tiêu"
                            className={`flex items-center justify-center w-6 h-6 rounded-md opacity-0 group-hover:opacity-100 transition-all ${
                              copiedKey === `q-${q}`
                                ? isDark ? 'opacity-100 bg-green-500/20 text-green-400' : 'opacity-100 bg-green-50 text-green-600'
                                : isDark ? 'bg-slate-600 text-slate-400 hover:bg-slate-500 hover:text-slate-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                            }`}
                          >
                            {copiedKey === `q-${q}` ? <IconCheck /> : <IconCopy />}
                          </button>
                        )}
                        {qProgress > 0 && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-green-600/20 text-green-400' : 'bg-green-50 text-green-600'}`}>
                            {qProgress}%
                          </span>
                        )}
                      </div>
                    </div>
                    <p className={`text-sm ${qGoal.objective
                      ? isDark ? 'text-slate-200' : 'text-slate-700'
                      : isDark ? 'text-slate-500 italic' : 'text-slate-400 italic'
                      }`}>
                      {qGoal.objective || 'Chưa đặt mục tiêu'}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Cấp Quý: hiển thị danh sách 3 Tháng */}
        {viewLevel === 'quarter' && (
          <div>
            <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              📋 Mục tiêu các Tháng trong Quý {selectedQuarter}/{selectedYear}
            </h3>
            <div className="space-y-3">
              {MONTHS_IN_QUARTER[selectedQuarter].map(m => {
                const mKey = monthKey(selectedYear, m)
                const mGoal = getGoal(mKey, selectedArea)
                const mProgress = getProgress(mKey, selectedArea)
                // Đếm tasks
                const totalTasks = mGoal.subGoals.reduce((sum, sg) => sum + sg.tasks.length, 0)
                const doneTasks = mGoal.subGoals.reduce((sum, sg) => sum + sg.tasks.filter(t => t.done).length, 0)
                return (
                  <div
                    key={m}
                    onClick={() => { resetInputs(); setViewLevel('month'); setSelectedMonth(m) }}
                    className={`group p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] ${isDark
                      ? 'bg-slate-700/30 border-slate-600 hover:border-indigo-500'
                      : 'bg-white border-slate-200 hover:border-indigo-400 shadow-sm'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                        {MONTH_NAMES[m]}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {mGoal.objective && (
                          <button
                            onClick={(e) => handleCopy(mGoal.objective, `m-${m}`, e)}
                            title="Copy mục tiêu"
                            className={`flex items-center justify-center w-6 h-6 rounded-md opacity-0 group-hover:opacity-100 transition-all ${
                              copiedKey === `m-${m}`
                                ? isDark ? 'opacity-100 bg-green-500/20 text-green-400' : 'opacity-100 bg-green-50 text-green-600'
                                : isDark ? 'bg-slate-600 text-slate-400 hover:bg-slate-500 hover:text-slate-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                            }`}
                          >
                            {copiedKey === `m-${m}` ? <IconCheck /> : <IconCopy />}
                          </button>
                        )}
                        {totalTasks > 0 && (
                          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {doneTasks}/{totalTasks} tasks
                          </span>
                        )}
                        {mProgress > 0 && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-green-600/20 text-green-400' : 'bg-green-50 text-green-600'}`}>
                            {mProgress}%
                          </span>
                        )}
                      </div>
                    </div>
                    <p className={`text-sm ${mGoal.objective
                      ? isDark ? 'text-slate-200' : 'text-slate-700'
                      : isDark ? 'text-slate-500 italic' : 'text-slate-400 italic'
                      }`}>
                      {mGoal.objective || 'Chưa đặt mục tiêu'}
                    </p>
                    {/* Mini sub-goals preview */}
                    {mGoal.subGoals.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {mGoal.subGoals.map(sg => (
                          <span key={sg.id} className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-slate-600 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                            {sg.title}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Cấp Tháng: hiển thị Sub-goals + Tasks (đầy đủ) */}
        {viewLevel === 'month' && (
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
                  className={`group/sg p-4 rounded-xl border ${isDark ? 'bg-slate-700/30 border-slate-600' : 'bg-white border-slate-200'}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${isDark ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-600'}`}>
                        {index + 1}
                      </span>
                      {subGoal.review && <ReviewStatus status={subGoal.review.status} size="sm" isDark={isDark} />}
                    </div>
                    <input
                      type="text"
                      value={subGoal.title}
                      onChange={(e) => updateSubGoal(periodKey, selectedArea, subGoal.id, e.target.value)}
                      className={`flex-1 px-3 py-1 rounded-lg border-none bg-transparent font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}
                      placeholder="Tên mục tiêu con..."
                    />
                    {/* Review sub-goal button */}
                    {subGoal.title && (
                      <button
                        onClick={() => setShowSubGoalReview(showSubGoalReview === subGoal.id ? null : subGoal.id)}
                        title="Đánh giá mục tiêu con"
                        className={`flex items-center justify-center w-6 h-6 rounded-md opacity-0 group-hover/sg:opacity-100 transition-all flex-shrink-0 ${
                          showSubGoalReview === subGoal.id
                            ? isDark ? 'opacity-100 bg-indigo-600 text-white' : 'opacity-100 bg-indigo-100 text-indigo-700'
                            : isDark ? 'bg-slate-600 text-slate-400 hover:bg-indigo-600/30 hover:text-indigo-400' : 'bg-slate-100 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600'
                        }`}
                      >
                        📝
                      </button>
                    )}
                    {/* Copy sub-goal */}
                    {subGoal.title && (
                      <button
                        onClick={() => handleCopy(subGoal.title, `sg-${subGoal.id}`)}
                        title="Copy mục tiêu con"
                        className={`flex items-center justify-center w-6 h-6 rounded-md opacity-0 group-hover/sg:opacity-100 transition-all ${
                          copiedKey === `sg-${subGoal.id}`
                            ? isDark ? 'opacity-100 bg-green-500/20 text-green-400' : 'opacity-100 bg-green-50 text-green-600'
                            : isDark ? 'bg-slate-600 text-slate-400 hover:bg-slate-500 hover:text-slate-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                        }`}
                      >
                        {copiedKey === `sg-${subGoal.id}` ? <IconCheck /> : <IconCopy />}
                      </button>
                    )}
                    <button
                      onClick={() => deleteSubGoal(periodKey, selectedArea, subGoal.id)}
                      className="text-red-400 hover:text-red-300 text-lg flex-shrink-0"
                    >
                      🗑️
                    </button>
                  </div>
                  {/* Sub-goal ReviewPanel mini */}
                  {showSubGoalReview === subGoal.id && (
                    <ReviewPanel
                      review={subGoal.review}
                      onSave={(review) => handleSaveSubGoalReview(subGoal.id, review)}
                      onCancel={() => setShowSubGoalReview(null)}
                      isDark={isDark}
                    />
                  )}

                  {/* Tasks */}
                  <div className="ml-9 space-y-2">
                    {subGoal.tasks.map(task => (
                      <Fragment key={task.id}>
                      <div className="group/task flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={task.done}
                          onChange={() => toggleTask(periodKey, selectedArea, subGoal.id, task.id)}
                          className="w-5 h-5 rounded border-slate-400 text-green-500 focus:ring-green-500"
                        />
                        <input
                          type="text"
                          value={task.text}
                          onChange={(e) => updateTask(periodKey, selectedArea, subGoal.id, task.id, { text: e.target.value })}
                          className={`flex-1 px-2 py-1 rounded bg-transparent ${task.done ? 'line-through opacity-50' : ''} ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
                        />
                        {/* Copy task */}
                        {task.text && (
                          <button
                            onClick={() => handleCopy(task.text, `task-${task.id}`)}
                            title="Copy task"
                            className={`flex items-center justify-center w-5 h-5 rounded-md opacity-0 group-hover/task:opacity-100 transition-all flex-shrink-0 ${
                              copiedKey === `task-${task.id}`
                                ? isDark ? 'opacity-100 bg-green-500/20 text-green-400' : 'opacity-100 bg-green-50 text-green-600'
                                : isDark ? 'bg-slate-600 text-slate-400 hover:bg-slate-500 hover:text-slate-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                            }`}
                          >
                            {copiedKey === `task-${task.id}` ? <IconCheck /> : <IconCopy />}
                          </button>
                        )}
                        <button
                          onClick={() => deleteTask(periodKey, selectedArea, subGoal.id, task.id)}
                          className="text-red-400 hover:text-red-300 opacity-50 hover:opacity-100 flex-shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                      {/* Task note: hiện khi đang edit hoặc đã có note */}
                      {editingTaskNote === task.id ? (
                        <div className="ml-8 mt-1 flex gap-2">
                          <input
                            type="text"
                            autoFocus
                            defaultValue={task.note || ''}
                            placeholder="Lý do chưa hoàn thành..."
                            onBlur={(e) => handleSaveTaskNote(subGoal.id, task.id, e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveTaskNote(subGoal.id, task.id, e.target.value); if (e.key === 'Escape') setEditingTaskNote(null) }}
                            className={`flex-1 px-2 py-0.5 rounded text-xs border ${isDark ? 'bg-slate-600 border-slate-500 text-white placeholder-slate-400' : 'bg-white border-slate-300 text-slate-700 placeholder-slate-400'}`}
                          />
                        </div>
                      ) : task.note ? (
                        <div
                          className="ml-8 mt-0.5 flex items-start gap-1 cursor-pointer"
                          onClick={() => setEditingTaskNote(task.id)}
                        >
                          <span className={`text-xs italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>↳ {task.note}</span>
                        </div>
                      ) : !task.done && (
                        <div
                          className="ml-8 mt-0.5 cursor-pointer opacity-0 group-hover/task:opacity-100 transition-opacity"
                          onClick={() => setEditingTaskNote(task.id)}
                        >
                          <span className={`text-xs ${isDark ? 'text-slate-600 hover:text-slate-500' : 'text-slate-400 hover:text-slate-500'}`}>+ Ghi chú lý do</span>
                        </div>
                      )}
                      </Fragment>
                    ))}

                    {/* Add task */}
                    {subGoal.tasks.length < 3 && (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newTaskTexts[subGoal.id] || ''}
                          onChange={(e) => setNewTaskTexts(prev => ({ ...prev, [subGoal.id]: e.target.value }))}
                          placeholder="+ Thêm task..."
                          className={`flex-1 px-3 py-1 rounded-lg text-sm ${isDark
                            ? 'bg-slate-600/50 text-white placeholder-slate-400'
                            : 'bg-slate-100 text-slate-700 placeholder-slate-400'
                            }`}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddTask(subGoal.id)}
                        />
                        <button
                          onClick={() => handleAddTask(subGoal.id)}
                          className={`px-3 py-1 rounded-lg text-sm ${isDark
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
                    className={`flex-1 px-4 py-3 rounded-xl border ${isDark
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
        )}
      </div>
    </div>
  )
}
