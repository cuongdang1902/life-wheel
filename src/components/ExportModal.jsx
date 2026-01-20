import { useState, useRef } from 'react'
import { toPng } from 'html-to-image'
import LifeWheel, { AREAS } from './LifeWheel'

export default function ExportModal({ isOpen, onClose, scores }) {
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
        backgroundColor: '#0f172a',
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
      <div className="bg-slate-800 rounded-2xl max-w-lg w-full border border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">📥 Export Life Wheel</h2>
          <p className="text-slate-400 text-sm mt-1">
            Xuất biểu đồ dưới dạng hình ảnh PNG
          </p>
        </div>

        {/* Preview */}
        <div className="p-6">
          <div
            ref={exportRef}
            className="bg-slate-900 p-6 rounded-xl"
          >
            {/* Export header */}
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-white">🎡 Life Wheel</h3>
              <p className="text-slate-400 text-sm">{today}</p>
            </div>

            {/* Wheel */}
            <div className="flex justify-center">
              <LifeWheel scores={scores} />
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
                  <span className="font-bold text-white">
                    {scores[area.id]}
                  </span>
                </div>
              ))}
            </div>

            {/* Average */}
            <div className="mt-4 text-center py-3 bg-indigo-600/20 rounded-xl">
              <div className="text-slate-400 text-sm">Điểm trung bình</div>
              <div className="text-2xl font-bold text-indigo-400">{avgScore}</div>
            </div>

            {/* Footer watermark */}
            <div className="mt-4 text-center text-slate-500 text-xs">
              Life Wheel App • {today}
            </div>
          </div>
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
            onClick={handleExport}
            disabled={exporting}
            className="px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 rounded-xl font-medium transition-colors flex items-center gap-2"
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
