import { useState, useRef } from 'react'
import { toPng } from 'html-to-image'
import LifeWheel, { AREAS } from './LifeWheel'

export default function ExportModal({ isOpen, onClose, scores, isDark = true }) {
  const [exporting, setExporting] = useState(false)
  const exportRef = useRef(null)

  if (!isOpen) return null

  const handleExport = async () => {
    if (!exportRef.current) return
    
    setExporting(true)
    try {
      const dataUrl = await toPng(exportRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: isDark ? '#0f172a' : '#f8fafc',
      })
      
      // Download
      const link = document.createElement('a')
      link.download = `life-wheel-${new Date().toISOString().split('T')[0]}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setExporting(false)
    }
  }

  const avgScore = (Object.values(scores).reduce((a, b) => a + b, 0) / 8).toFixed(1)
  const today = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`rounded-2xl max-w-lg w-full border shadow-2xl ${
        isDark 
          ? 'bg-slate-800 border-slate-700' 
          : 'bg-white border-slate-200'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            📥 Export Life Wheel
          </h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Xuất biểu đồ dưới dạng hình ảnh PNG
          </p>
        </div>

        {/* Preview */}
        <div className="p-6">
          <div
            ref={exportRef}
            className={`p-6 rounded-xl ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}
          >
            {/* Export header */}
            <div className="text-center mb-4">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                🎡 Life Wheel
              </h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{today}</p>
            </div>

            {/* Wheel */}
            <div className="flex justify-center">
              <LifeWheel scores={scores} isDark={isDark} />
            </div>

            {/* Scores summary */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {AREAS.map(area => (
                <div 
                  key={area.id}
                  className="flex items-center justify-between px-3 py-1.5 rounded-lg"
                  style={{ backgroundColor: `${area.color}15` }}
                >
                  <span className="text-sm" style={{ color: area.color }}>
                    {area.name}
                  </span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {scores[area.id]}
                  </span>
                </div>
              ))}
            </div>

            {/* Average */}
            <div className="mt-4 text-center py-3 bg-indigo-600/20 rounded-xl">
              <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Điểm trung bình
              </div>
              <div className="text-2xl font-bold text-indigo-500">{avgScore}</div>
            </div>

            {/* Footer watermark */}
            <div className={`mt-4 text-center text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Life Wheel App • {today}
            </div>
          </div>
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
            onClick={handleExport}
            disabled={exporting}
            className="px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            {exporting ? (
              <>
                <span className="animate-spin">⏳</span>
                Đang xuất...
              </>
            ) : (
              <>
                📥 Tải PNG
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
