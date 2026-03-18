import { useState } from 'react'
import ReviewStatus, { REVIEW_STATUS } from './ReviewStatus'

export default function ReviewPanel({ review, onSave, onCancel, isDark = true }) {
  const [status, setStatus] = useState(review?.status || null)
  const [note, setNote] = useState(review?.note || '')

  const handleSave = () => {
    if (!status) return
    onSave({ status, note: note.trim(), reviewedAt: new Date().toISOString().split('T')[0] })
  }

  const statusOptions = [
    { key: 'achieved', label: '✅ Đạt', activeClass: 'bg-green-500 text-white ring-2 ring-green-400', inactiveClass: isDark ? 'bg-slate-600 text-slate-300 hover:bg-green-500/20 hover:text-green-400' : 'bg-slate-100 text-slate-600 hover:bg-green-50 hover:text-green-700' },
    { key: 'partial', label: '⚡ Một phần', activeClass: 'bg-yellow-500 text-white ring-2 ring-yellow-400', inactiveClass: isDark ? 'bg-slate-600 text-slate-300 hover:bg-yellow-500/20 hover:text-yellow-400' : 'bg-slate-100 text-slate-600 hover:bg-yellow-50 hover:text-yellow-700' },
    { key: 'not_achieved', label: '❌ Không đạt', activeClass: 'bg-red-500 text-white ring-2 ring-red-400', inactiveClass: isDark ? 'bg-slate-600 text-slate-300 hover:bg-red-500/20 hover:text-red-400' : 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-700' },
  ]

  return (
    <div className={`mt-3 p-4 rounded-xl border ${isDark ? 'bg-slate-700/60 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
      {/* Tiêu đề */}
      <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        Đánh giá kết quả
      </p>

      {/* Status buttons */}
      <div className="flex flex-wrap gap-2 mb-3">
        {statusOptions.map(opt => (
          <button
            key={opt.key}
            onClick={() => setStatus(opt.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${status === opt.key ? opt.activeClass : opt.inactiveClass}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Note textarea */}
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={
          status === 'not_achieved' ? 'Lý do không đạt được? Bạn đã học được gì?...'
            : status === 'partial' ? 'Bạn đạt được phần nào? Còn thiếu gì?...'
            : 'Ghi chú thêm (tuỳ chọn)...'
        }
        rows={2}
        className={`w-full px-3 py-2 rounded-lg text-sm resize-none border ${isDark
          ? 'bg-slate-600 border-slate-500 text-white placeholder-slate-400'
          : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
        }`}
      />

      {/* Footer: ngày review cũ + buttons */}
      <div className="flex items-center justify-between mt-3">
        {review?.reviewedAt ? (
          <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Đã review: {review.reviewedAt}
          </span>
        ) : <span />}
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${isDark ? 'bg-slate-600 text-slate-300 hover:bg-slate-500' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={!status}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${status
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : isDark ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            Lưu đánh giá
          </button>
        </div>
      </div>
    </div>
  )
}
