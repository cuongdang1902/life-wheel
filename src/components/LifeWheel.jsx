import { useMemo } from 'react'

const AREAS = [
  { id: 'health', name: 'Sức khỏe', color: '#22c55e' },
  { id: 'career', name: 'Sự nghiệp', color: '#3b82f6' },
  { id: 'finance', name: 'Tài chính', color: '#eab308' },
  { id: 'family', name: 'Gia đình', color: '#ec4899' },
  { id: 'growth', name: 'Phát triển', color: '#8b5cf6' },
  { id: 'recreation', name: 'Giải trí', color: '#f97316' },
  { id: 'spiritual', name: 'Tâm linh', color: '#06b6d4' },
  { id: 'contribution', name: 'Đóng góp', color: '#14b8a6' },
]

const SIZE = 400
const CENTER = SIZE / 2
const MAX_RADIUS = 160
const LABEL_RADIUS = MAX_RADIUS + 30

export default function LifeWheel({ scores, comparisonScores = null }) {
  const numAreas = AREAS.length
  const angleStep = (2 * Math.PI) / numAreas

  // Tính tọa độ điểm trên wheel
  // Mỗi lĩnh vực nằm GIỮA 2 trục, nên đỉnh nằm giữa cánh
  const getPoint = (index, score) => {
    // Góc ở GIỮA sector (không phải trên trục)
    const angle = index * angleStep + angleStep / 2 - Math.PI / 2
    const radius = (score / 10) * MAX_RADIUS
    return {
      x: CENTER + radius * Math.cos(angle),
      y: CENTER + radius * Math.sin(angle),
    }
  }

  // Tọa độ label (nằm trên trục phân chia)
  const getLabelPoint = (index) => {
    const angle = index * angleStep - Math.PI / 2
    return {
      x: CENTER + LABEL_RADIUS * Math.cos(angle),
      y: CENTER + LABEL_RADIUS * Math.sin(angle),
    }
  }

  // Tạo đường path cho polygon
  const currentPath = useMemo(() => {
    const points = AREAS.map((area, i) => {
      const point = getPoint(i, scores[area.id] || 0)
      return `${point.x},${point.y}`
    })
    return `M ${points.join(' L ')} Z`
  }, [scores])

  // Đường path cho snapshot so sánh (nếu có)
  const comparisonPath = useMemo(() => {
    if (!comparisonScores) return null
    const points = AREAS.map((area, i) => {
      const point = getPoint(i, comparisonScores[area.id] || 0)
      return `${point.x},${point.y}`
    })
    return `M ${points.join(' L ')} Z`
  }, [comparisonScores])

  // Tạo các vòng tròn đồng tâm (grid)
  const circles = [2, 4, 6, 8, 10]

  // Tạo các đường chia sector (trục)
  const axisLines = AREAS.map((_, i) => {
    const angle = i * angleStep - Math.PI / 2
    return {
      x2: CENTER + MAX_RADIUS * Math.cos(angle),
      y2: CENTER + MAX_RADIUS * Math.sin(angle),
    }
  })

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="drop-shadow-2xl">
      {/* Background gradient */}
      <defs>
        <radialGradient id="bgGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background circle */}
      <circle cx={CENTER} cy={CENTER} r={MAX_RADIUS + 10} fill="url(#bgGradient)" />

      {/* Grid circles */}
      {circles.map((level) => (
        <circle
          key={level}
          cx={CENTER}
          cy={CENTER}
          r={(level / 10) * MAX_RADIUS}
          fill="none"
          stroke="#334155"
          strokeWidth="1"
          strokeDasharray={level === 10 ? "none" : "4,4"}
          opacity={0.5}
        />
      ))}

      {/* Axis lines (trục chia sector) */}
      {axisLines.map((line, i) => (
        <line
          key={i}
          x1={CENTER}
          y1={CENTER}
          x2={line.x2}
          y2={line.y2}
          stroke="#475569"
          strokeWidth="1"
          opacity={0.6}
        />
      ))}

      {/* Sector fills with gradient */}
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
        
        return (
          <path
            key={area.id}
            d={pathD}
            fill={area.color}
            opacity={0.3}
          />
        )
      })}

      {/* Comparison polygon (dashed) */}
      {comparisonPath && (
        <path
          d={comparisonPath}
          fill="none"
          stroke="#94a3b8"
          strokeWidth="2"
          strokeDasharray="8,4"
          opacity={0.8}
        />
      )}

      {/* Current polygon (main) */}
      <path
        d={currentPath}
        fill="rgba(99, 102, 241, 0.15)"
        stroke="#6366f1"
        strokeWidth="3"
        filter="url(#glow)"
      />

      {/* Dots at vertices */}
      {AREAS.map((area, i) => {
        const point = getPoint(i, scores[area.id] || 0)
        return (
          <g key={`dot-${area.id}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r="8"
              fill={area.color}
              stroke="white"
              strokeWidth="2"
              className="drop-shadow-lg"
            />
            <circle
              cx={point.x}
              cy={point.y}
              r="3"
              fill="white"
            />
          </g>
        )
      })}

      {/* Labels */}
      {AREAS.map((area, i) => {
        const labelPos = getLabelPoint(i)
        const angle = i * angleStep - Math.PI / 2
        const angleDeg = (angle * 180) / Math.PI
        
        // Điều chỉnh anchor dựa trên vị trí
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
            fontSize="11"
            fontWeight="600"
            className="select-none"
          >
            {area.name}
          </text>
        )
      })}

      {/* Center score */}
      <text
        x={CENTER}
        y={CENTER}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize="24"
        fontWeight="bold"
      >
        {Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 8 * 10) / 10}
      </text>
      <text
        x={CENTER}
        y={CENTER + 18}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#94a3b8"
        fontSize="10"
      >
        Điểm TB
      </text>
    </svg>
  )
}

export { AREAS }
