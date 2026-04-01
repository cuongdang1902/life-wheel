import { useState, useEffect, useRef } from 'react'
import { AREAS } from '../wheel/LifeWheel'

const AREA_MAP = Object.fromEntries(AREAS.map(a => [a.id, a]))

const STATUS_CONFIG = {
  pending: { label: 'Chưa làm', color: 'text-slate-400', bg: '' },
  completed: { label: '✅ Hoàn thành', color: 'text-green-500', bg: 'line-through opacity-60' },
}

export default function BucketListItem({ item, isDark, onUpdate, onDelete, onToggle, index, readOnly = false }) {
  const [editing, setEditing] = useState(false)
  const [titleVal, setTitleVal] = useState(item.title || '')
  const [descVal, setDescVal] = useState(item.description || '')
  const [areaVal, setAreaVal] = useState(item.area_id || '')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    setTitleVal(item.title || '')
    setDescVal(item.description || '')
    setAreaVal(item.area_id || '')
  }, [item.id])

  const handleSave = () => {
    if (!titleVal.trim() && !item.title) {
      setEditing(false)
      return
    }
    onUpdate(item.id, { title: titleVal.trim(), description: descVal.trim(), area_id: areaVal })
    setEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') { setEditing(false); setTitleVal(item.title || '') }
  }

  const area = AREA_MAP[item.area_id]
  const isCompleted = item.status === 'completed'

  return (
    <div className={`group flex items-start gap-3 p-3 rounded-xl transition-all duration-200 ${isDark ? 'hover:bg-slate-700/40' : 'hover:bg-slate-50'} ${isCompleted ? 'opacity-70' : ''}`}>
      {/* Number + Checkbox */}
      <div className="flex flex-col items-center gap-1 pt-0.5 flex-shrink-0">
        <span className={`text-xs font-bold w-5 text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{index + 1}</span>
        {!readOnly && (
          <button
            onClick={() => onToggle(item.id)}
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${isCompleted
              ? 'bg-green-500 border-green-500 text-white'
              : isDark ? 'border-slate-500 hover:border-green-400' : 'border-slate-300 hover:border-green-400'
              }`}
          >
            {isCompleted && <span className="text-xs">✓</span>}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {editing && !readOnly ? (
          <div className="space-y-2">
            <input
              ref={inputRef}
              type="text"
              value={titleVal}
              onChange={e => setTitleVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Điều bạn muốn làm trước khi..."
              autoFocus
              className={`w-full px-2 py-1 rounded-lg border text-sm ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-slate-300 text-slate-800'} outline-none`}
            />
            <input
              type="text"
              value={descVal}
              onChange={e => setDescVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Mô tả thêm (tuỳ chọn)..."
              className={`w-full px-2 py-1 rounded-lg border text-xs ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-slate-300 text-slate-800'} outline-none`}
            />
            {/* Area picker — dropdown với tên đầy đủ */}
            <div className="relative">
              <select
                value={areaVal}
                onChange={e => setAreaVal(e.target.value)}
                className={`w-full appearance-none px-2 py-1 rounded-lg border text-xs outline-none transition-colors ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-800'}`}
              >
                <option value="">— Không chọn lĩnh vực —</option>
                {AREAS.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs hover:bg-indigo-500 transition-colors">Lưu</button>
              <button onClick={() => { setEditing(false); setTitleVal(item.title || '') }} className={`px-3 py-1 rounded-lg text-xs ${isDark ? 'bg-slate-600 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>Hủy</button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => !readOnly && setEditing(true)}
            className={`cursor-pointer ${readOnly ? 'cursor-default' : ''}`}
          >
            {item.title ? (
              <>
                <p className={`text-sm font-medium leading-snug ${STATUS_CONFIG[item.status]?.bg} ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                  {item.title}
                </p>
                {item.description && (
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.description}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  {area && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-medium text-white" style={{ backgroundColor: area.color + 'cc' }}>
                      {area.name}
                    </span>
                  )}
                  {isCompleted && item.completed_at && (
                    <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      ✅ {new Date(item.completed_at).toLocaleDateString('vi-VN')}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <p className={`text-sm italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {readOnly ? '—' : 'Click để thêm điều bạn muốn làm...'}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Delete */}
      {!readOnly && !editing && item.title && (
        <button
          onClick={() => {
            if (confirmDelete) onDelete(item.id)
            else { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000) }
          }}
          className={`opacity-0 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center text-xs transition-all flex-shrink-0 ${confirmDelete ? 'opacity-100 text-red-400' : isDark ? 'text-slate-500 hover:text-red-400' : 'text-slate-400 hover:text-red-500'}`}
        >
          {confirmDelete ? '⚠' : '✕'}
        </button>
      )}
    </div>
  )
}
