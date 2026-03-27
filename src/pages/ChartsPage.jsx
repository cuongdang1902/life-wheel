import { useState, useMemo } from 'react'
import { useTheme } from '../features/theme/ThemeContext'
import TrendChart from '../features/snapshots/TrendChart'
import { AREAS } from '../features/wheel/LifeWheel'
import { formatDate } from '../features/snapshots/useSnapshots'

const CUR_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 21 }, (_, i) => 2022 + i) // 2022–2042
const PERIOD_LABEL = { month: 'Tháng', quarter: 'Quý', year: 'Năm' }

export default function ChartsPage({ snapshots, onDelete, onDeleteByPeriod }) {
  const { isDark } = useTheme()

  // Chart mode
  const [chartMode, setChartMode] = useState('year') // 'year' | 'range'

  // Single-year mode
  const [selectedYear, setSelectedYear] = useState(CUR_YEAR)

  // Range mode
  const [fromYear, setFromYear] = useState(CUR_YEAR - 1)
  const [toYear, setToYear] = useState(CUR_YEAR)

  // Area selection — all by default
  const [selectedAreas, setSelectedAreas] = useState(AREAS.map(a => a.id))

  // Snapshot list
  const [showList, setShowList] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const toggleArea = (id) => {
    setSelectedAreas(prev =>
      prev.includes(id)
        ? prev.length === 1 ? prev : prev.filter(a => a !== id)
        : [...prev, id]
    )
  }
  const allSelected = selectedAreas.length === AREAS.length
  const toggleAll = () => setSelectedAreas(allSelected ? [AREAS[0].id] : AREAS.map(a => a.id))

  // Stats for current view
  const visibleSnapshots = useMemo(() => {
    return snapshots.filter(s => {
      const y = new Date(s.date).getFullYear()
      if (chartMode === 'year') return y === selectedYear
      return y >= fromYear && y <= toYear
    })
  }, [snapshots, chartMode, selectedYear, fromYear, toYear])

  const avgScore = useMemo(() => {
    if (!visibleSnapshots.length) return null
    const all = visibleSnapshots.flatMap(s => Object.values(s.scores || {}))
    return (all.reduce((a, b) => a + b, 0) / all.length).toFixed(1)
  }, [visibleSnapshots])

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>📈 Charts</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Xu hướng điểm số Life Wheel theo thời gian</p>
        </div>
        <div className="flex gap-3">
          <div className={`px-4 py-2 rounded-xl text-center border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{visibleSnapshots.length}</div>
            <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Snapshots</div>
          </div>
          {avgScore && (
            <div className={`px-4 py-2 rounded-xl text-center border ${isDark ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-200'}`}>
              <div className="text-xl font-bold text-indigo-500">{avgScore}</div>
              <div className={`text-xs ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Điểm TB</div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className={`mb-5 p-4 rounded-2xl border space-y-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>

        {/* Mode toggle */}
        <div className="flex items-center gap-3 flex-wrap">
          <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Chế độ xem</p>
          <div className={`flex rounded-xl overflow-hidden border ${isDark ? 'border-slate-600' : 'border-slate-300'}`}>
            <button
              onClick={() => setChartMode('year')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${chartMode === 'year'
                ? 'bg-indigo-600 text-white'
                : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
            >📅 Theo năm</button>
            <button
              onClick={() => setChartMode('range')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${chartMode === 'range'
                ? 'bg-indigo-600 text-white'
                : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
            >📆 Khoảng thời gian</button>
          </div>
        </div>

        {/* Year selector — mode: year */}
        {chartMode === 'year' && (
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Chọn năm</p>
            <div className="flex flex-wrap gap-1.5">
              {YEARS.map(y => (
                <button
                  key={y}
                  onClick={() => setSelectedYear(y)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${selectedYear === y
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : isDark ? 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                >{y}</button>
              ))}
            </div>
          </div>
        )}

        {/* Range selector — mode: range */}
        {chartMode === 'range' && (
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Khoảng thời gian</p>
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <span className={`text-xs mr-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Từ</span>
                <select
                  value={fromYear}
                  onChange={e => { const y = Number(e.target.value); setFromYear(y); if (y > toYear) setToYear(y) }}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium border ${isDark ? 'bg-slate-700 text-white border-slate-600' : 'bg-white text-slate-700 border-slate-300'}`}
                >
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <span className={`text-xs mr-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>đến</span>
                <select
                  value={toYear}
                  onChange={e => setToYear(Number(e.target.value))}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium border ${isDark ? 'bg-slate-700 text-white border-slate-600' : 'bg-white text-slate-700 border-slate-300'}`}
                >
                  {YEARS.filter(y => y >= fromYear).map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{toYear - fromYear + 1} năm</span>
            </div>
          </div>
        )}

        {/* Area selector */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Lĩnh vực</p>
            <button
              onClick={toggleAll}
              className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${isDark ? 'border-slate-600 text-slate-400 hover:text-slate-200' : 'border-slate-300 text-slate-500 hover:text-slate-700'}`}
            >
              {allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {AREAS.map(area => {
              const isActive = selectedAreas.includes(area.id)
              return (
                <button
                  key={area.id}
                  onClick={() => toggleArea(area.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${isActive
                    ? 'text-white border-transparent shadow-sm'
                    : isDark ? 'border-slate-600 text-slate-400 hover:border-slate-400' : 'border-slate-300 text-slate-500 hover:border-slate-400'
                    }`}
                  style={isActive ? { backgroundColor: area.color, borderColor: area.color } : {}}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.7)' : area.color }} />
                  {area.name.split(' ')[0]}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className={`mb-5 p-5 rounded-2xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
        {chartMode === 'year' && (
          <p className={`text-sm font-medium mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            📅 Điểm số 12 tháng năm {selectedYear}
          </p>
        )}
        {chartMode === 'range' && (
          <p className={`text-sm font-medium mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            📆 Xu hướng từ {fromYear} đến {toYear}
          </p>
        )}
        <TrendChart
          snapshots={snapshots}
          isDark={isDark}
          selectedAreas={selectedAreas}
          mode={chartMode}
          selectedYear={selectedYear}
          fromYear={fromYear}
          toYear={toYear}
        />
      </div>

      {/* Snapshot list (collapsible) */}
      <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
        <button
          onClick={() => setShowList(v => !v)}
          className={`w-full px-5 py-3 flex items-center justify-between text-sm font-medium transition-colors ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'}`}
        >
          <span>📂 Quản lý snapshots ({snapshots.length})</span>
          <span>{showList ? '▲' : '▼'}</span>
        </button>

        {showList && (
          <div className={`divide-y max-h-72 overflow-y-auto ${isDark ? 'divide-slate-700' : 'divide-slate-200'}`}>
            {snapshots.length === 0 ? (
              <div className={`px-5 py-8 text-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Chỉnh slider trên trang Wheel để tự động lưu snapshot
              </div>
            ) : (
              [...snapshots]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map(snapshot => (
                  <div key={snapshot.id} className={`px-5 py-3 flex items-center justify-between gap-3 group ${isDark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>
                        {PERIOD_LABEL[snapshot.period] || snapshot.period}
                      </span>
                      <span className={`text-sm truncate ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{formatDate(snapshot.date)}</span>
                      <span className={`text-xs flex-shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        TB {(Object.values(snapshot.scores || {}).reduce((a, b) => a + b, 0) / 8).toFixed(1)}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        if (confirmDelete === snapshot.id) {
                          onDelete(snapshot.id)
                          setConfirmDelete(null)
                        } else {
                          setConfirmDelete(snapshot.id)
                          setTimeout(() => setConfirmDelete(null), 3000)
                        }
                      }}
                      className={`flex-shrink-0 text-xs px-2 py-1 rounded-lg transition-colors ${confirmDelete === snapshot.id
                        ? 'bg-red-500/20 text-red-400'
                        : 'opacity-0 group-hover:opacity-100 ' + (isDark ? 'text-slate-500 hover:text-red-400' : 'text-slate-400 hover:text-red-500')
                        }`}
                    >
                      {confirmDelete === snapshot.id ? '⚠ Xác nhận?' : '🗑️'}
                    </button>
                  </div>
                ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
