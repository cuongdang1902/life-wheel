import { useState } from 'react'
import { PERIODS } from '../hooks/useSnapshots'

export default function SaveSnapshotModal({ isOpen, onClose, onSave }) {
  const [selectedPeriod, setSelectedPeriod] = useState('week')

  if (!isOpen) return null

  const handleSave = () => {
    onSave(selectedPeriod)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl max-w-md w-full border border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">💾 Lưu Snapshot</h2>
          <p className="text-slate-400 text-sm mt-1">
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
                  : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
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
                <div className="text-white font-medium">{period.label}</div>
                <div className="text-slate-400 text-sm">
                  {period.value === 'week' && 'Đánh giá hàng tuần'}
                  {period.value === 'month' && 'Đánh giá hàng tháng'}
                  {period.value === 'year' && 'Đánh giá hàng năm'}
                </div>
              </div>
            </label>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-600 hover:bg-slate-500 rounded-xl font-medium transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-medium transition-colors"
          >
            💾 Lưu
          </button>
        </div>
      </div>
    </div>
  )
}
