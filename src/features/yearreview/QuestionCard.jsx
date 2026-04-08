import { useState, useRef, useEffect } from 'react'

export default function QuestionCard({ question, answer, onSave, isDark }) {
  const [value, setValue] = useState(answer || '')
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef(null)

  // Sync when answer prop changes (e.g. year switch)
  useEffect(() => {
    setValue(answer || '')
  }, [answer])

  const handleChange = (e) => {
    const newVal = e.target.value
    setValue(newVal)
    onSave(question.id, newVal)
  }

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.max(ta.scrollHeight, 80)}px`
  }, [value])

  const hasAnswer = value.trim().length > 0
  const catColor = question.category.color

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-300 overflow-hidden
        ${isFocused
          ? isDark
            ? 'border-indigo-500/70 shadow-lg shadow-indigo-500/10'
            : 'border-indigo-400 shadow-lg shadow-indigo-100'
          : hasAnswer
            ? isDark
              ? 'border-emerald-500/30 bg-emerald-500/5'
              : 'border-emerald-200 bg-emerald-50/40'
            : isDark
              ? 'border-slate-700 hover:border-slate-600'
              : 'border-slate-200 hover:border-slate-300 bg-white'
        }
      `}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl transition-all duration-300"
        style={{
          backgroundColor: isFocused || hasAnswer ? catColor : 'transparent',
          opacity: isFocused ? 1 : hasAnswer ? 0.6 : 0
        }}
      />

      <div className="p-5 pl-6">
        {/* Question header */}
        <div className="flex items-start gap-3 mb-3">
          {/* Number badge */}
          <div
            className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
            style={{ backgroundColor: hasAnswer ? catColor : isDark ? '#334155' : '#e2e8f0', color: hasAnswer ? '#fff' : isDark ? '#94a3b8' : '#64748b' }}
          >
            {hasAnswer ? '✓' : question.number}
          </div>

          {/* Category + Question */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-sm">{question.category.icon}</span>
              <span
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: catColor }}
              >
                {question.category.label}
              </span>
            </div>
            <p className={`text-sm font-semibold leading-snug ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
              {question.question}
            </p>
          </div>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={question.placeholder}
          className={`w-full resize-none rounded-xl px-4 py-3 text-sm leading-relaxed outline-none transition-all duration-200
            ${isDark
              ? 'bg-slate-800/80 text-slate-200 placeholder-slate-500 focus:bg-slate-800'
              : 'bg-slate-50 text-slate-700 placeholder-slate-400 focus:bg-white'
            }
            border ${isFocused
              ? 'border-indigo-400'
              : isDark ? 'border-slate-700' : 'border-slate-200'
            }
          `}
          style={{ minHeight: '80px', overflow: 'hidden' }}
        />
      </div>
    </div>
  )
}
