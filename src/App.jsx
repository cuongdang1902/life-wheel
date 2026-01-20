import { useState, useEffect, useCallback } from 'react'
import LifeWheel, { AREAS } from './components/LifeWheel'
import SnapshotModal from './components/SnapshotModal'
import SaveSnapshotModal from './components/SaveSnapshotModal'
import ExportModal from './components/ExportModal'
import ThemeToggle from './components/ThemeToggle'
import useSnapshots from './hooks/useSnapshots'
import { useTheme } from './context/ThemeContext'
import './App.css'

function App() {
  const { isDark } = useTheme()
  const [scores, setScores] = useState(
    AREAS.reduce((acc, area) => ({ ...acc, [area.id]: 5 }), {})
  )
  
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showSnapshotsModal, setShowSnapshotsModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [compareEnabled, setCompareEnabled] = useState(false)
  const [selectedSnapshotId, setSelectedSnapshotId] = useState(null)
  const [toast, setToast] = useState(null)

  const {
    snapshots,
    addSnapshot,
    deleteSnapshot,
    deleteByPeriod,
    getLatestSnapshot,
    getSnapshotById,
  } = useSnapshots()

  // Logic an toàn: nếu snapshot đang so sánh bị xóa, quay về snapshot gần nhất
  const comparisonScores = useCallback(() => {
    if (!compareEnabled) return null
    
    // Nếu có snapshot được chọn và nó vẫn tồn tại
    if (selectedSnapshotId) {
      const snapshot = getSnapshotById(selectedSnapshotId)
      if (snapshot) return snapshot.scores
    }
    
    // Fallback: dùng snapshot gần nhất
    const latest = getLatestSnapshot()
    return latest?.scores || null
  }, [compareEnabled, selectedSnapshotId, getSnapshotById, getLatestSnapshot])

  // Auto-clear selectedSnapshotId nếu nó không còn tồn tại
  useEffect(() => {
    if (selectedSnapshotId && !getSnapshotById(selectedSnapshotId)) {
      setSelectedSnapshotId(null)
    }
  }, [snapshots, selectedSnapshotId, getSnapshotById])

  const handleScoreChange = (areaId, value) => {
    setScores(prev => ({ ...prev, [areaId]: Number(value) }))
  }

  const handleSaveSnapshot = (period) => {
    addSnapshot(scores, period)
    showToast('✅ Đã lưu snapshot thành công!')
  }

  const handleDeleteSnapshot = (id) => {
    deleteSnapshot(id)
    showToast('🗑️ Đã xóa snapshot')
  }

  const handleDeleteByPeriod = (period) => {
    deleteByPeriod(period)
    showToast(`🗑️ Đã xóa tất cả snapshot (${period})`)
  }

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className={`min-h-screen p-4 md:p-6 transition-colors duration-300 ${
      isDark 
        ? 'bg-slate-900 text-white' 
        : 'bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 text-slate-900'
    }`}>
      <ThemeToggle />
      
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="text-center mb-6 md:mb-8">
          <h1 className={`text-3xl md:text-4xl font-bold bg-clip-text text-transparent ${
            isDark 
              ? 'bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400'
              : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600'
          }`}>
            🎡 Life Wheel
          </h1>
          <p className={`mt-2 text-sm md:text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Đánh giá cân bằng cuộc sống của bạn
          </p>
        </header>

        {/* Compare indicator */}
        {compareEnabled && (
          <div className="mb-4 text-center">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
              isDark ? 'bg-slate-700/50 text-slate-300' : 'bg-white/80 text-slate-700 shadow-sm'
            }`}>
              <span className="w-3 h-3 rounded-full bg-slate-400" />
              <span>
                Đường nét đứt: {selectedSnapshotId ? 'Snapshot đã chọn' : 'Snapshot gần nhất'}
              </span>
              <button
                onClick={() => setCompareEnabled(false)}
                className="ml-2 text-red-400 hover:text-red-300"
              >
                ✕
              </button>
            </span>
          </div>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8 items-start">
          {/* Wheel */}
          <div className={`lg:col-span-2 rounded-2xl p-4 md:p-6 flex items-center justify-center border transition-colors ${
            isDark 
              ? 'bg-slate-800/50 border-slate-700' 
              : 'bg-white/70 border-slate-200 shadow-xl backdrop-blur-sm'
          }`}>
            <LifeWheel 
              scores={scores} 
              comparisonScores={comparisonScores()}
              isDark={isDark}
            />
          </div>

          {/* Sliders */}
          <div className={`rounded-2xl p-4 md:p-6 border transition-colors ${
            isDark 
              ? 'bg-slate-800/50 border-slate-700' 
              : 'bg-white/70 border-slate-200 shadow-xl backdrop-blur-sm'
          }`}>
            <h2 className={`text-lg md:text-xl font-semibold mb-4 md:mb-6 ${
              isDark ? 'text-slate-200' : 'text-slate-800'
            }`}>
              📊 Điểm số các lĩnh vực
            </h2>
            <div className="space-y-4 md:space-y-5">
              {AREAS.map(area => (
                <div key={area.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label 
                      className="text-sm font-medium flex items-center gap-2"
                      style={{ color: area.color }}
                    >
                      <span 
                        className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full" 
                        style={{ backgroundColor: area.color }}
                      />
                      {area.name}
                    </label>
                    <span 
                      className="text-lg md:text-xl font-bold w-10 text-center rounded-lg py-0.5 md:py-1"
                      style={{ 
                        backgroundColor: `${area.color}20`,
                        color: area.color 
                      }}
                    >
                      {scores[area.id]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={scores[area.id]}
                    onChange={(e) => handleScoreChange(area.id, e.target.value)}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${area.color} 0%, ${area.color} ${scores[area.id] * 10}%, ${isDark ? '#334155' : '#e2e8f0'} ${scores[area.id] * 10}%, ${isDark ? '#334155' : '#e2e8f0'} 100%)`
                    }}
                  />
                  <div className={`flex justify-between text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    <span>0</span>
                    <span>5</span>
                    <span>10</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Average score */}
            <div className={`mt-6 pt-4 border-t text-center ${
              isDark ? 'border-slate-700' : 'border-slate-200'
            }`}>
              <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Điểm trung bình</div>
              <div className="text-3xl font-bold text-indigo-500">
                {(Object.values(scores).reduce((a, b) => a + b, 0) / 8).toFixed(1)}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 md:mt-8 flex flex-wrap gap-3 md:gap-4 justify-center">
          <button 
            onClick={() => setShowSaveModal(true)}
            className="px-5 md:px-6 py-2.5 md:py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 text-sm md:text-base shadow-lg shadow-indigo-500/25"
          >
            💾 Lưu Snapshot
          </button>
          <button 
            onClick={() => setShowSnapshotsModal(true)}
            className={`px-5 md:px-6 py-2.5 md:py-3 rounded-xl font-medium transition-colors flex items-center gap-2 text-sm md:text-base ${
              isDark 
                ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                : 'bg-white hover:bg-slate-50 text-slate-700 shadow-md border border-slate-200'
            }`}
          >
            📊 Snapshots
            {snapshots.length > 0 && (
              <span className="bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full">
                {snapshots.length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setCompareEnabled(!compareEnabled)}
            className={`px-5 md:px-6 py-2.5 md:py-3 rounded-xl font-medium transition-colors flex items-center gap-2 text-sm md:text-base ${
              compareEnabled 
                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/25' 
                : isDark 
                  ? 'bg-slate-700 hover:bg-slate-600 text-white'
                  : 'bg-white hover:bg-slate-50 text-slate-700 shadow-md border border-slate-200'
            }`}
          >
            🔄 So sánh
          </button>
          <button 
            onClick={() => setShowExportModal(true)}
            className={`px-5 md:px-6 py-2.5 md:py-3 rounded-xl font-medium transition-colors flex items-center gap-2 text-sm md:text-base ${
              isDark 
                ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                : 'bg-white hover:bg-slate-50 text-slate-700 shadow-md border border-slate-200'
            }`}
          >
            📥 Export
          </button>
        </div>

        {/* Footer */}
        <footer className={`text-center mt-10 md:mt-12 text-xs md:text-sm ${
          isDark ? 'text-slate-500' : 'text-slate-400'
        }`}>
          <p>🎡 Life Wheel - Đánh giá cân bằng cuộc sống</p>
        </footer>
      </div>

      {/* Modals */}
      <SaveSnapshotModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveSnapshot}
        isDark={isDark}
      />

      <SnapshotModal
        isOpen={showSnapshotsModal}
        onClose={() => setShowSnapshotsModal(false)}
        snapshots={snapshots}
        onDelete={handleDeleteSnapshot}
        onDeleteByPeriod={handleDeleteByPeriod}
        selectedSnapshotId={selectedSnapshotId}
        onSelectSnapshot={setSelectedSnapshotId}
        compareEnabled={compareEnabled}
        onToggleCompare={setCompareEnabled}
        isDark={isDark}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        scores={scores}
        isDark={isDark}
      />

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg border z-50 animate-pulse ${
          isDark 
            ? 'bg-slate-700 border-slate-600 text-white' 
            : 'bg-white border-slate-200 text-slate-800'
        }`}>
          {toast}
        </div>
      )}
    </div>
  )
}

export default App
