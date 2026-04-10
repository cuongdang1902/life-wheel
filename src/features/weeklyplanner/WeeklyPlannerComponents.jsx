import { useState, useRef, useEffect } from 'react'

// Days of week labels
const DAY_LABELS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN']
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getDayDate(weekStart, dayIndex) {
  const d = new Date(weekStart)
  d.setDate(d.getDate() + dayIndex)
  return d
}

function formatDay(date) {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`
}

function isToday(date) {
  const today = new Date()
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
}

// ─── Inline editable cell ────────────────────────────────────────────
function EditableCell({ value, onChange, placeholder, className = '', multiline = false }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const ref = useRef(null)

  useEffect(() => { setDraft(value) }, [value])
  useEffect(() => { if (editing && ref.current) ref.current.focus() }, [editing])

  const commit = () => {
    setEditing(false)
    if (draft !== value) onChange(draft)
  }

  if (editing) {
    const props = {
      ref,
      value: draft,
      onChange: e => setDraft(e.target.value),
      onBlur: commit,
      onKeyDown: e => {
        if (e.key === 'Enter' && !multiline) commit()
        if (e.key === 'Escape') { setDraft(value); setEditing(false) }
      },
      className: `w-full bg-transparent outline-none text-sm ${className}`,
    }
    return multiline
      ? <textarea {...props} rows={2} style={{ resize: 'none' }} />
      : <input {...props} />
  }

  return (
    <span
      onClick={() => setEditing(true)}
      className={`cursor-pointer text-sm select-none ${value ? '' : 'opacity-40 italic'} ${className}`}
    >
      {value || placeholder}
    </span>
  )
}

// ─── Task Cell ──────────────────────────────────────────────────────
export function TaskCell({ tasks, onAdd, onToggle, onDelete, isDark }) {
  const [adding, setAdding] = useState(false)
  const [newText, setNewText] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (adding && inputRef.current) inputRef.current.focus()
  }, [adding])

  const handleAdd = () => {
    if (newText.trim()) {
      onAdd(newText.trim())
      setNewText('')
    }
    setAdding(false)
  }

  return (
    <div className="space-y-1 min-h-[28px]">
      {tasks.map(task => (
        <div key={task.id} className="group/task flex items-center gap-1">
          <input
            type="checkbox"
            checked={task.done}
            onChange={() => onToggle(task.id)}
            className="w-3.5 h-3.5 rounded border-slate-400 text-indigo-500 focus:ring-indigo-500 flex-shrink-0 cursor-pointer"
          />
          <span className={`flex-1 text-xs leading-tight truncate ${task.done
            ? isDark ? 'line-through opacity-40 text-slate-400' : 'line-through opacity-40 text-slate-500'
            : isDark ? 'text-slate-200' : 'text-slate-700'
          }`}>
            {task.text}
          </span>
          <button
            onClick={() => onDelete(task.id)}
            className="opacity-0 group-hover/task:opacity-100 text-red-400 hover:text-red-300 text-xs flex-shrink-0 transition-opacity"
          >✕</button>
        </div>
      ))}
      {adding ? (
        <div className="flex items-center gap-1">
          <input
            ref={inputRef}
            value={newText}
            onChange={e => setNewText(e.target.value)}
            onBlur={handleAdd}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') { setAdding(false); setNewText('') } }}
            placeholder="Task..."
            className={`w-full text-xs px-1.5 py-0.5 rounded border outline-none ${isDark
              ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500'
              : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
            }`}
          />
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className={`text-xs transition-colors ${isDark
            ? 'text-slate-600 hover:text-indigo-400'
            : 'text-slate-400 hover:text-indigo-600'
          }`}
        >
          + thêm task
        </button>
      )}
    </div>
  )
}

// ─── Role Row ────────────────────────────────────────────────────────
export function RoleRow({
  role, index, weekStart, isDark,
  onUpdateRole, onDeleteRole, onToggleStar,
  getTasks, onAddTask, onToggleTask, onDeleteTask,
}) {
  const isEven = index % 2 === 0
  const starredBg = role.star
    ? isDark ? 'bg-indigo-900/30' : 'bg-indigo-50'
    : isEven
      ? isDark ? 'bg-slate-800/40' : 'bg-slate-50/60'
      : isDark ? 'bg-slate-800/20' : 'bg-white'

  const textMain = isDark ? 'text-slate-100' : 'text-slate-800'
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500'
  const borderColor = isDark ? 'border-slate-700/60' : 'border-slate-200'

  return (
    <tr className={`group/row border-b ${borderColor} ${starredBg} transition-colors`}>
      {/* Star */}
      <td className={`px-2 py-2 border-r ${borderColor} w-8 align-top`}>
        <button
          onClick={() => onToggleStar(role.id)}
          className="transition-transform hover:scale-110"
        >
          {role.star
            ? <span className="text-amber-400 text-base">★</span>
            : <span className={`text-base ${isDark ? 'text-slate-600 hover:text-amber-400' : 'text-slate-300 hover:text-amber-400'}`}>☆</span>
          }
        </button>
      </td>

      {/* Role name */}
      <td className={`px-3 py-2 border-r ${borderColor} w-32 align-top`}>
        <div className="flex items-center gap-1">
          <EditableCell
            value={role.name}
            onChange={v => onUpdateRole(role.id, { name: v })}
            placeholder="Vai trò..."
            className={`font-medium ${textMain}`}
          />
          <button
            onClick={() => onDeleteRole(role.id)}
            className={`opacity-0 group-hover/row:opacity-100 text-xs flex-shrink-0 transition-opacity ${isDark ? 'text-slate-600 hover:text-red-400' : 'text-slate-300 hover:text-red-400'}`}
          >✕</button>
        </div>
      </td>

      {/* Weekly goal */}
      <td className={`px-3 py-2 border-r ${borderColor} w-48 align-top`}>
        <EditableCell
          value={role.goal}
          onChange={v => onUpdateRole(role.id, { goal: v })}
          placeholder="Mục tiêu tuần này..."
          className={textMuted}
        />
      </td>

      {/* Notes */}
      <td className={`px-3 py-2 border-r ${borderColor} w-36 align-top`}>
        <EditableCell
          value={role.note}
          onChange={v => onUpdateRole(role.id, { note: v })}
          placeholder="Ghi chú..."
          className={`text-amber-500 dark:text-amber-400`}
        />
      </td>

      {/* Day cells (Mon–Sun) */}
      {Array.from({ length: 7 }, (_, d) => {
        const tasks = getTasks(weekStart, role.id, d)
        return (
          <td key={d} className={`px-2 py-2 border-r ${borderColor} align-top min-w-[120px]`}>
            <TaskCell
              tasks={tasks}
              onAdd={text => onAddTask(role.id, d, text)}
              onToggle={taskId => onToggleTask(role.id, d, taskId)}
              onDelete={taskId => onDeleteTask(role.id, d, taskId)}
              isDark={isDark}
            />
          </td>
        )
      })}
    </tr>
  )
}
