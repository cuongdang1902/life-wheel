import { useState, useRef, useEffect } from 'react'

const REFLECTION_QUESTIONS = [
  {
    key: 'goals_achieved',
    question: 'Bạn đã đạt được mục tiêu nào trong tuần này?',
    placeholder: 'Nhìn lại những thành tựu của bạn...',
  },
  {
    key: 'challenges',
    question: 'Bạn đã gặp những thử thách nào?',
    placeholder: 'Nghĩ về những rào cản bạn đã đối mặt...',
  },
  {
    key: 'decisions',
    question: 'Bạn đã đưa ra quyết định gì quan trọng? Khi ưu tiên, bạn tập trung vào điều gì nhất?',
    placeholder: 'Nghĩ về quá trình ra quyết định của bạn...',
  },
]

function ReflectionQuestion({ q, value, onChange, isDark }) {
  const [draft, setDraft] = useState(value || '')
  const textareaRef = useRef(null)

  useEffect(() => { setDraft(value || '') }, [value])

  // Auto-resize
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.max(ta.scrollHeight, 72)}px`
  }, [draft])

  const handleBlur = () => {
    if (draft !== (value || '')) onChange(q.key, draft)
  }

  return (
    <div>
      <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
        {q.question}
      </p>
      <textarea
        ref={textareaRef}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={handleBlur}
        placeholder={q.placeholder}
        style={{ minHeight: '72px', overflow: 'hidden', resize: 'none' }}
        className={`w-full px-3 py-2 rounded-xl text-sm leading-relaxed outline-none border transition-all duration-200
          ${isDark
            ? 'bg-slate-800/80 text-slate-200 placeholder-slate-600 border-slate-700 focus:border-indigo-500/70'
            : 'bg-slate-50 text-slate-700 placeholder-slate-400 border-slate-200 focus:border-indigo-400'
          }`}
      />
    </div>
  )
}

export default function WeeklyReflection({ weekStart, reflection, onSave, isDark }) {
  const answeredCount = REFLECTION_QUESTIONS.filter(q => reflection[q.key]?.trim()).length

  return (
    <div className={`rounded-2xl border p-5 ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🪞</span>
          <h3 className={`font-bold ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
            Phản tư cuối tuần
          </h3>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${answeredCount === 3
          ? 'bg-emerald-500/20 text-emerald-400'
          : isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'
        }`}>
          {answeredCount}/3
        </span>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {REFLECTION_QUESTIONS.map(q => (
          <ReflectionQuestion
            key={q.key}
            q={q}
            value={reflection[q.key] || ''}
            onChange={onSave}
            isDark={isDark}
          />
        ))}
      </div>
    </div>
  )
}
