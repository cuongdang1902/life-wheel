import { useState } from 'react'
import { PERIODS } from '../hooks/useSnapshots'

export default function SaveSnapshotModal({ isOpen, onClose, onSave, isDark = true }) {
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  if (!isOpen) return null

  const handleSave = () => {
    onSave(selectedPeriod)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`rounded-2xl max-w-md w-full border shadow-2xl ${
        isDark 
          ? 'bg-slate-800 border-slate-700' 
          : 'bg-white border-slate-200'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            💾 Lưu Snapshot
          </h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Chọn chu kỳ đánh giá để lưu snapshot
          </p>
        </div>

        {/* Period selection */}
        <div className="p-6 space-y-3">
          {PERIODS.map(period => (
            <label
              key={period.value}
              className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer border transition-all ${
                selectedPeriod === period.value
                  ? 'bg-indigo-600/20 border-indigo-500'
                  : isDark 
                    ? 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="period"
                value={period.value}
                checked={selectedPeriod === period.value}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-5 h-5 text-indigo-500 bg-slate-700 border-slate-500 focus:ring-indigo-500"
              />
              <div>
                <div className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {period.label}
                </div>
                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {period.value === 'month' && 'Đánh giá hàng tháng'}
                  {period.value === 'quarter' && 'Đánh giá hàng quý'}
                  {period.value === 'year' && 'Đánh giá hàng năm'}
                </div>
              </div>
            </label>
          ))}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex gap-3 justify-end ${
          isDark ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <button
            onClick={onClose}
            className={`px-5 py-2.5 rounded-xl font-medium transition-colors ${
              isDark 
                ? 'bg-slate-600 hover:bg-slate-500 text-white' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
          >
            💾 Lưu
          </button>
        </div>
      </div>
    </div>
  )
}
