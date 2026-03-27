import { useState } from 'react'
import { AREAS } from '../wheel/LifeWheel'

export default function DreamBoardCard({ item, isDark, onEdit, onDelete, onToggleAchieved, readOnly = false }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const area = AREAS.find(a => a.id === item.area_id)
  const isAchieved = item.status === 'achieved'

  const handleDeleteClick = () => {
    if (confirmDelete) {
      onDelete(item.id)
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  return (
    <div className={`group relative rounded-2xl overflow-hidden border shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'} ${isAchieved ? 'ring-2 ring-yellow-400/50' : ''}`}>
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-indigo-500/30 to-purple-600/30 overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={e => { e.target.style.display = 'none' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl opacity-30">🌟</div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          {isAchieved ? (
            <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-400 text-yellow-900">🏆 Đã đạt được</span>
          ) : (
            <span className="px-2 py-1 rounded-full text-xs font-bold bg-indigo-500/80 text-white backdrop-blur-sm">✨ Đang theo đuổi</span>
          )}
        </div>

        {/* Area badge */}
        {area && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 rounded-full text-xs font-bold backdrop-blur-sm text-white" style={{ backgroundColor: area.color + 'cc' }}>
              {area.name.split(' ')[0]}
            </span>
          </div>
        )}

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-white font-bold text-base leading-tight drop-shadow-md line-clamp-2">
            {item.title}
          </h3>
        </div>
      </div>

      {/* Body */}
      {item.affirmation && (
        <div className={`px-4 py-3 border-b text-sm italic leading-relaxed ${isDark ? 'text-indigo-300 border-slate-700' : 'text-indigo-600 border-slate-100'}`}>
          "{item.affirmation}"
        </div>
      )}

      {/* Actions */}
      {!readOnly && (
        <div className={`px-4 py-3 flex items-center gap-2`}>
          {/* Toggle achieved */}
          <button
            onClick={() => onToggleAchieved(item.id)}
            title={isAchieved ? 'Đánh dấu chưa đạt' : 'Đánh dấu đã đạt'}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${isAchieved
              ? isDark ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
              : isDark ? 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
              }`}
          >
            {isAchieved ? '↩️ Chưa đạt' : '🏆 Đã đạt được!'}
          </button>
          <button
            onClick={() => onEdit(item)}
            title="Chỉnh sửa"
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'}`}
          >✏️</button>
          <button
            onClick={handleDeleteClick}
            title={confirmDelete ? 'Xác nhận xóa?' : 'Xóa'}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors ${confirmDelete ? 'bg-red-500/20 text-red-400' : isDark ? 'hover:bg-slate-700 text-slate-400 hover:text-red-400' : 'hover:bg-red-50 text-slate-400 hover:text-red-500'}`}
          >
            {confirmDelete ? '⚠️' : '🗑️'}
          </button>
        </div>
      )}
    </div>
  )
}
