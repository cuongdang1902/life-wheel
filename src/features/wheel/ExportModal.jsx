import { useState, useRef } from 'react'
import { toPng } from 'html-to-image'
import { AREAS } from './LifeWheel'

// Smaller wheel for export
function ExportWheel({ scores, isDark }) {
  const SIZE = 300
  const CENTER = SIZE / 2
  const MAX_RADIUS = 100
  const LABEL_RADIUS = MAX_RADIUS + 22 // Giảm 1/3 từ 33 (tỷ lệ với LifeWheel)
  const numAreas = AREAS.length
  const angleStep = (2 * Math.PI) / numAreas

  // Điểm ở giữa cánh cung (cho dots)
  const getPoint = (index, score) => {
    const angle = index * angleStep + angleStep / 2 - Math.PI / 2
    const radius = (score / 10) * MAX_RADIUS
    return {
      x: CENTER + radius * Math.cos(angle),
      y: CENTER + radius * Math.sin(angle),
    }
  }

  // Label ở giữa cánh cung (sector)
  const getLabelPoint = (index) => {
    const angle = index * angleStep + angleStep / 2 - Math.PI / 2
    return {
      x: CENTER + LABEL_RADIUS * Math.cos(angle),
      y: CENTER + LABEL_RADIUS * Math.sin(angle),
    }
  }

  const currentPath = 'M ' + AREAS.map((area, i) => {
    const point = getPoint(i, scores[area.id] || 0)
    return `${point.x},${point.y}`
  }).join(' L ') + ' Z'

  const circles = [2, 4, 6, 8, 10]
  const axisLines = AREAS.map((_, i) => {
    const angle = i * angleStep - Math.PI / 2
    return {
      x2: CENTER + MAX_RADIUS * Math.cos(angle),
      y2: CENTER + MAX_RADIUS * Math.sin(angle),
    }
  })

  const bgGradientStart = isDark ? '#1e293b' : '#f8fafc'
  const bgGradientEnd = isDark ? '#0f172a' : '#e2e8f0'
  const gridColor = isDark ? '#334155' : '#cbd5e1'
  const textColor = isDark ? 'white' : '#1e293b'

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id="exportBgGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={bgGradientStart} />
          <stop offset="100%" stopColor={bgGradientEnd} />
        </radialGradient>
      </defs>

      <circle cx={CENTER} cy={CENTER} r={MAX_RADIUS + 10} fill="url(#exportBgGradient)" />

      {circles.map((level) => (
        <circle
          key={level}
          cx={CENTER}
          cy={CENTER}
          r={(level / 10) * MAX_RADIUS}
          fill="none"
          stroke={gridColor}
          strokeWidth="1"
          strokeDasharray={level === 10 ? "none" : "3,3"}
          opacity={0.5}
        />
      ))}

      {axisLines.map((line, i) => (
        <line
          key={i}
          x1={CENTER}
          y1={CENTER}
          x2={line.x2}
          y2={line.y2}
          stroke={gridColor}
          strokeWidth="1"
          opacity={0.6}
        />
      ))}

      {AREAS.map((area, i) => {
        const score = scores[area.id] || 0
        if (score === 0) return null
        const startAngle = i * angleStep - Math.PI / 2
        const endAngle = (i + 1) * angleStep - Math.PI / 2
        const radius = (score / 10) * MAX_RADIUS
        const x1 = CENTER + radius * Math.cos(startAngle)
        const y1 = CENTER + radius * Math.sin(startAngle)
        const x2 = CENTER + radius * Math.cos(endAngle)
        const y2 = CENTER + radius * Math.sin(endAngle)
        const pathD = `M ${CENTER},${CENTER} L ${x1},${y1} A ${radius},${radius} 0 0,1 ${x2},${y2} Z`
        return <path key={area.id} d={pathD} fill={area.color} opacity={0.5} />
      })}

      <path
        d={currentPath}
        fill={isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.2)'}
        stroke="#6366f1"
        strokeWidth="2"
      />

      {AREAS.map((area, i) => {
        const point = getPoint(i, scores[area.id] || 0)
        return (
          <g key={`dot-${area.id}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r="5"
              fill={area.color}
              stroke="white"
              strokeWidth="1.5"
            />
            <circle
              cx={point.x}
              cy={point.y}
              r="2"
              fill="white"
            />
          </g>
        )
      })}

      {AREAS.map((area, i) => {
        const labelPos = getLabelPoint(i)
        // Góc ở giữa sector (để tính text anchor)
        const angle = i * angleStep + angleStep / 2 - Math.PI / 2
        const angleDeg = (angle * 180) / Math.PI
        let textAnchor = 'middle'
        if (angleDeg > -80 && angleDeg < 80) textAnchor = 'start'
        if (angleDeg > 100 || angleDeg < -100) textAnchor = 'end'
        return (
          <text
            key={`label-${area.id}`}
            x={labelPos.x}
            y={labelPos.y}
            textAnchor={textAnchor}
            dominantBaseline="middle"
            fill={area.color}
            fontSize="15"
            fontWeight="600"
          >
            {area.name.split(' ').slice(0, 2).join(' ')}
          </text>
        )
      })}

      <text x={CENTER} y={CENTER} textAnchor="middle" dominantBaseline="middle" fill={textColor} fontSize="18" fontWeight="bold">
        {Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 8 * 10) / 10}
      </text>
      <text x={CENTER} y={CENTER + 14} textAnchor="middle" dominantBaseline="middle" fill={isDark ? '#94a3b8' : '#64748b'} fontSize="8">
        Điểm TB
      </text>
    </svg>
  )
}

// Tỉ lệ 9:16 (Story Instagram)
const STORY_WIDTH = 360
const STORY_HEIGHT = 640

export default function ExportModal({ isOpen, onClose, scores, isDark = true }) {
  const [exporting, setExporting] = useState(false)
  const exportRef = useRef(null)
  const exportStoryRef = useRef(null)

  if (!isOpen) return null

  const doExport = async (ref, filename, options = {}) => {
    if (!ref?.current) return
    setExporting(true)
    try {
      const dataUrl = await toPng(ref.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: isDark ? '#0f172a' : '#f8fafc',
        ...options,
      })
      const link = document.createElement('a')
      link.download = filename
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setExporting(false)
    }
  }

  const handleExport = () =>
    doExport(exportRef, `life-wheel-${new Date().toISOString().split('T')[0]}.png`)

  const handleExportStory = () =>
    doExport(
      exportStoryRef,
      `life-wheel-story-${new Date().toISOString().split('T')[0]}.png`,
      { width: STORY_WIDTH, height: STORY_HEIGHT }
    )

  const avgScore = (Object.values(scores).reduce((a, b) => a + b, 0) / 8).toFixed(1)
  const today = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden border shadow-2xl ${isDark
          ? 'bg-slate-800 border-slate-700'
          : 'bg-white border-slate-200'
        }`}>
        {/* Header */}
        <div className={`p-4 border-b flex justify-between items-center ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div>
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              📥 Export Life Wheel
            </h2>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Xuất biểu đồ dưới dạng hình ảnh PNG
            </p>
          </div>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xl ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
              }`}
          >
            ×
          </button>
        </div>

        {/* Preview */}
        <div className="p-4 overflow-y-auto max-h-[65vh]">
          <div
            ref={exportRef}
            className={`p-4 rounded-xl ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}
          >
            {/* Export header */}
            <div className="text-center mb-2">
              <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`} style={{ fontSize: '23px' }}>
                🎡 Life Wheel
              </h3>
              <p className={isDark ? 'text-slate-400' : 'text-slate-500'} style={{ fontSize: '14px' }}>{today}</p>
            </div>

            {/* Wheel */}
            <div className="flex justify-center">
              <ExportWheel scores={scores} isDark={isDark} />
            </div>

            {/* Scores summary */}
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              {AREAS.map(area => (
                <div
                  key={area.id}
                  className="flex items-center justify-between px-2 py-1 rounded-lg"
                  style={{ backgroundColor: `${area.color}15` }}
                >
                  <span className="text-xs" style={{ color: area.color }}>
                    {area.name}
                  </span>
                  <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {scores[area.id]}
                  </span>
                </div>
              ))}
            </div>

            {/* Average */}
            <div className="mt-3 text-center py-2 bg-indigo-600/20 rounded-xl">
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Điểm trung bình
              </div>
              <div className="text-xl font-bold text-indigo-500">{avgScore}</div>
            </div>

            {/* Footer watermark */}
            <div className={`mt-2 text-center text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Life Wheel App • {today}
            </div>
          </div>

          {/* Story 9:16 layout (off-screen for capture) */}
          <div
            ref={exportStoryRef}
            className={`absolute left-[-9999px] top-0 flex flex-col items-center justify-center rounded-2xl overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-gradient-to-br from-slate-50 to-indigo-50'}`}
            style={{ width: STORY_WIDTH, height: STORY_HEIGHT }}
          >
            <div className="text-center px-6 flex-1 flex flex-col items-center justify-center">
              <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`} style={{ fontSize: '28px' }}>
                🎡 Life Wheel
              </h3>
              <p className={isDark ? 'text-slate-400' : 'text-slate-500'} style={{ fontSize: '14px', marginTop: '8px' }}>{today}</p>
              <div className="mt-6 flex justify-center">
                <ExportWheel scores={scores} isDark={isDark} />
              </div>
              <div className={`mt-6 px-6 py-3 rounded-2xl ${isDark ? 'bg-indigo-600/20' : 'bg-white/80'}`}>
                <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Điểm trung bình</div>
                <div className="text-2xl font-bold text-indigo-500">{avgScore}</div>
              </div>
            </div>
            <div className={`py-3 text-center text-xs w-full ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Life Wheel • {today}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex gap-3 justify-end ${isDark ? 'border-slate-700' : 'border-slate-200'
          }`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${isDark
                ? 'bg-slate-600 hover:bg-slate-500 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
          >
            Hủy
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            {exporting ? (
              <>
                <span className="animate-spin">⏳</span>
                Đang xuất...
              </>
            ) : (
              <>📥 PNG</>
            )}
          </button>
          <button
            onClick={handleExportStory}
            disabled={exporting}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            📱 Story 9:16
          </button>
        </div>
      </div>
    </div>
  )
}
