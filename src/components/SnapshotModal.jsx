import { useState } from 'react'
import { formatDate, getPeriodLabel, PERIODS } from '../hooks/useSnapshots'

export default function SnapshotModal({
  isOpen,
  onClose,
  snapshots,
  onDelete,
  onDeleteByPeriod,
  selectedSnapshotId,
  onSelectSnapshot,
  compareEnabled,
  onToggleCompare,
}) {
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [confirmDeletePeriod, setConfirmDeletePeriod] = useState(null)

  if (!isOpen) return null

  const groupedSnapshots = PERIODS.map(period => ({
    ...period,
    items: snapshots.filter(s => s.period === period.value),
  }))

  const handleDelete = (id) => {
    onDelete(id)
    setConfirmDelete(null)
    // Nếu đang xóa snapshot đang được chọn, tự động clear
    if (selectedSnapshotId === id) {
      onSelectSnapshot(null)
    }
  }

  const handleDeleteByPeriod = (period) => {
    onDeleteByPeriod(period)
    setConfirmDeletePeriod(null)
    // Nếu snapshot đang chọn thuộc period này, clear
    const deletedSnapshot = snapshots.find(s => s.id === selectedSnapshotId)
    if (deletedSnapshot?.period === period) {
      onSelectSnapshot(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">📊 Snapshots</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Compare toggle */}
        <div className="px-6 py-4 bg-slate-700/30 border-b border-slate-700">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={compareEnabled}
              onChange={(e) => onToggleCompare(e.target.checked)}
              className="w-5 h-5 rounded border-slate-500 bg-slate-700 text-indigo-500 focus:ring-indigo-500"
            />
            <span className="text-slate-200">So với snapshot</span>
            {compareEnabled && selectedSnapshotId && (
              <span className="text-sm text-indigo-400 ml-2">
                (Đang so sánh với snapshot đã chọn)
              </span>
            )}
            {compareEnabled && !selectedSnapshotId && (
              <span className="text-sm text-slate-400 ml-2">
                (Tự động: snapshot gần nhất)
              </span>
            )}
          </label>
        </div>

        {/* Snapshot list */}
        <div className="p-6 overflow-y-auto max-h-[50vh] space-y-6">
          {snapshots.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <div className="text-5xl mb-4">📭</div>
              <p>Chưa có snapshot nào</p>
              <p className="text-sm mt-2">Nhấn "Lưu Snapshot" để bắt đầu</p>
            </div>
          ) : (
            groupedSnapshots.map(group => (
              group.items.length > 0 && (
                <div key={group.value}>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-slate-300">
                      {group.label} ({group.items.length})
                    </h3>
                    {confirmDeletePeriod === group.value ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeleteByPeriod(group.value)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-sm"
                        >
                          Xác nhận
                        </button>
                        <button
                          onClick={() => setConfirmDeletePeriod(null)}
                          className="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded-lg text-sm"
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeletePeriod(group.value)}
                        className="text-sm text-red-400 hover:text-red-300"
                      >
                        Xóa ({group.label})
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {group.items.map(snapshot => (
                      <div
                        key={snapshot.id}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          selectedSnapshotId === snapshot.id
                            ? 'bg-indigo-600/20 border-indigo-500'
                            : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                        }`}
                        onClick={() => onSelectSnapshot(
                          selectedSnapshotId === snapshot.id ? null : snapshot.id
                        )}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-white font-medium">
                              {formatDate(snapshot.date)}
                            </div>
                            <div className="text-sm text-slate-400 mt-1">
                              Điểm TB: {(
                                Object.values(snapshot.scores).reduce((a, b) => a + b, 0) / 8
                              ).toFixed(1)}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {selectedSnapshotId === snapshot.id && (
                              <span className="px-2 py-1 bg-indigo-500 rounded text-xs">
                                Đang chọn
                              </span>
                            )}
                            {confirmDelete === snapshot.id ? (
                              <div className="flex gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDelete(snapshot.id)
                                  }}
                                  className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                                >
                                  Xóa
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setConfirmDelete(null)
                                  }}
                                  className="px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded text-xs"
                                >
                                  Hủy
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setConfirmDelete(snapshot.id)
                                }}
                                className="text-red-400 hover:text-red-300 text-lg"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {/* Mini scores preview */}
                        <div className="flex gap-1 mt-3 flex-wrap">
                          {Object.entries(snapshot.scores).map(([key, value]) => (
                            <span
                              key={key}
                              className="px-2 py-0.5 bg-slate-600/50 rounded text-xs text-slate-300"
                            >
                              {value}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-600 hover:bg-slate-500 rounded-xl font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
