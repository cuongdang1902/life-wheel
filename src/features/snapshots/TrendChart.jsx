import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { AREAS } from '../wheel/LifeWheel'

const AREA_MAP = Object.fromEntries(AREAS.map(a => [a.id, a]))
const MONTH_LABELS = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12']
const DEFAULT_SCORES = AREAS.reduce((acc, a) => ({ ...acc, [a.id]: null }), {})

function CustomTooltip({ active, payload, label, isDark }) {
  if (!active || !payload?.length) return null
  const entries = payload.filter(e => e.value !== null && e.value !== undefined)
  if (!entries.length) return null
  return (
    <div className={`rounded-xl border px-4 py-3 shadow-xl text-sm ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'}`}>
      <p className={`font-semibold mb-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{label}</p>
      {entries.map(entry => {
        const area = AREA_MAP[entry.dataKey]
        return (
          <div key={entry.dataKey} className="flex items-center gap-2 py-0.5">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
            <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>{area?.name ?? entry.dataKey}:</span>
            <span className="font-bold" style={{ color: entry.color }}>{entry.value}</span>
          </div>
        )
      })}
    </div>
  )
}

/**
 * mode = 'year'  → snapshots filtered to selectedYear, aggregated by month (12 points max)
 * mode = 'range' → snapshots filtered fromYear–toYear, sorted chronologically
 */
export default function TrendChart({ snapshots, isDark = true, selectedAreas, mode, selectedYear, fromYear, toYear }) {
  const visibleAreas = selectedAreas?.length ? AREAS.filter(a => selectedAreas.includes(a.id)) : AREAS
  const gridStroke = isDark ? '#334155' : '#e2e8f0'
  const textColor = isDark ? '#94a3b8' : '#64748b'

  const chartData = useMemo(() => {
    if (!snapshots?.length) return []

    // Helper: extract year and month from snapshot without timezone issues
    const getMK = (s) => {
      if (s.monthKey) return s.monthKey // preferred: explicit field
      // Fallback: parse ISO string directly "2026-01-15T..." → year=2026, month=1
      const m = s.date?.match(/^(\d{4})-(\d{2})/)
      return m ? `${m[1]}-${m[2]}` : null
    }
    const getYear = (s) => {
      const mk = getMK(s)
      return mk ? parseInt(mk.split('-')[0], 10) : new Date(s.date).getFullYear()
    }
    const getMonth = (s) => {
      const mk = getMK(s)
      return mk ? parseInt(mk.split('-')[1], 10) : (new Date(s.date).getMonth() + 1)
    }

    if (mode === 'year') {
      // Build 12-month grid for the selected year
      const byMonth = {} // month (1-12) → best snapshot
      snapshots.forEach(s => {
        if (getYear(s) !== selectedYear) return
        const m = getMonth(s)
        if (!byMonth[m] || new Date(s.date) > new Date(byMonth[m].date)) {
          byMonth[m] = s
        }
      })
      return MONTH_LABELS.map((label, i) => {
        const m = i + 1
        const snap = byMonth[m]
        const point = { date: label }
        AREAS.forEach(area => {
          point[area.id] = snap ? (snap.scores?.[area.id] ?? null) : null
        })
        return point
      })
    }

    // mode === 'range': aggregate snapshots by year → one point per year
    const years = []
    for (let y = fromYear; y <= toYear; y++) years.push(y)

    return years.map(y => {
      const inYear = snapshots.filter(s => getYear(s) === y)
      const point = { date: String(y) }
      AREAS.forEach(area => {
        const vals = inYear.map(s => s.scores?.[area.id]).filter(v => v !== null && v !== undefined)
        point[area.id] = vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : null
      })
      return point
    })
  }, [snapshots, mode, selectedYear, fromYear, toYear])

  const hasAnyData = chartData.some(p => visibleAreas.some(a => p[a.id] !== null))

  if (!hasAnyData) {
    return (
      <div className={`flex flex-col items-center justify-center h-64 rounded-2xl border ${isDark ? 'border-slate-700 bg-slate-800/30' : 'border-slate-200 bg-slate-50'}`}>
        <div className="text-5xl mb-4">📉</div>
        <p className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          {mode === 'year' ? `Chưa có dữ liệu cho năm ${selectedYear}` : 'Chưa có dữ liệu trong khoảng này'}
        </p>
        <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Chỉnh điểm trên trang Wheel để tự động lưu</p>
      </div>
    )
  }

  return (
    <div className="h-[450px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 16, left: -8, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} opacity={0.5} />
          <XAxis
            dataKey="date"
            tick={{ fill: textColor, fontSize: 11 }}
            tickLine={{ stroke: gridStroke }}
            axisLine={{ stroke: gridStroke }}
            interval={mode === 'year' ? 0 : 'preserveStartEnd'}
          />
          <YAxis
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            tick={{ fill: textColor, fontSize: 11 }}
            tickLine={{ stroke: gridStroke }}
            axisLine={{ stroke: gridStroke }}
          />
          <Tooltip content={<CustomTooltip isDark={isDark} />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
            formatter={name => AREA_MAP[name]?.name ?? name}
          />
          <ReferenceLine y={5} stroke={isDark ? '#475569' : '#cbd5e1'} strokeDasharray="6 3" />
          {visibleAreas.map(area => (
            <Line
              key={area.id}
              type="monotone"
              dataKey={area.id}
              name={area.id}
              stroke={area.color}
              strokeWidth={2.5}
              dot={{ r: 4, fill: area.color, strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: isDark ? '#1e293b' : '#fff' }}
              connectNulls={false}
              animationDuration={600}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
