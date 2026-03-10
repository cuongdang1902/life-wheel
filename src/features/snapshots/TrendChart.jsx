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
} from 'recharts'
import { AREAS } from '../wheel/LifeWheel'
import { formatDate } from './useSnapshots'

/**
 * Biểu đồ xu hướng điểm số từng lĩnh vực qua thời gian (từ snapshots).
 */
export default function TrendChart({ snapshots, isDark = true }) {
  const chartData = useMemo(() => {
    if (!snapshots?.length) return []
    const sorted = [...snapshots].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    return sorted.map((s) => {
      const point = {
        date: formatDate(s.date),
        fullDate: s.date,
      }
      AREAS.forEach((area) => {
        point[area.id] = s.scores?.[area.id] ?? 0
      })
      return point
    })
  }, [snapshots])

  const gridStroke = isDark ? '#334155' : '#e2e8f0'
  const textColor = isDark ? '#94a3b8' : '#64748b'

  if (chartData.length === 0) {
    return (
      <div
        className={`rounded-xl border p-8 text-center ${
          isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'
        }`}
      >
        <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
          Chưa đủ dữ liệu. Lưu thêm snapshot để xem xu hướng.
        </p>
      </div>
    )
  }

  return (
    <div
      className={`rounded-xl border p-4 ${
        isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'
      }`}
    >
      <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
        📈 Xu hướng điểm số
      </h3>
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} opacity={0.5} />
            <XAxis
              dataKey="date"
              tick={{ fill: textColor, fontSize: 11 }}
              tickLine={{ stroke: gridStroke }}
              axisLine={{ stroke: gridStroke }}
            />
            <YAxis
              domain={[0, 10]}
              tick={{ fill: textColor, fontSize: 11 }}
              tickLine={{ stroke: gridStroke }}
              axisLine={{ stroke: gridStroke }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1e293b' : '#fff',
                border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
                borderRadius: '12px',
              }}
              labelStyle={{ color: isDark ? '#e2e8f0' : '#0f172a' }}
              formatter={(value) => [value, '']}
              labelFormatter={(label) => label}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              formatter={(name) => AREAS.find((a) => a.id === name)?.name ?? name}
            />
            {AREAS.map((area) => (
              <Line
                key={area.id}
                type="monotone"
                dataKey={area.id}
                name={area.id}
                stroke={area.color}
                strokeWidth={2}
                dot={{ r: 3, fill: area.color }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
