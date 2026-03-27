import { useState, useEffect, useMemo } from 'react'
import { useTheme } from '../features/theme/ThemeContext'
import BucketListItem from '../features/bucketlist/BucketListItem'

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 11 }, (_, i) => currentYear - 2 + i)

export default function BucketListPage({ getItemsForYear, ensureYear, addItem, updateItem, deleteItem, toggleCompleted }) {
  const { isDark } = useTheme()
  const [selectedYear, setSelectedYear] = useState(currentYear)

  // Ensure this year has items when the page loads or year changes
  useEffect(() => {
    ensureYear(selectedYear)
  }, [selectedYear, ensureYear])

  const items = getItemsForYear(selectedYear)

  const stats = useMemo(() => {
    const filled = items.filter(i => i.title?.trim())
    const completed = filled.filter(i => i.status === 'completed')
    return { total: filled.length, completed: completed.length }
  }, [items])

  const progressPct = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100)

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
          📋 Bucket List
        </h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Những điều bạn muốn làm trong đời — chia theo từng năm
        </p>
      </div>

      {/* Year selector + stats */}
      <div className={`mb-5 p-4 rounded-2xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {/* Year tabs */}
          <div className={`flex rounded-xl overflow-hidden border ${isDark ? 'border-slate-600' : 'border-slate-300'}`}>
            {YEARS.map(y => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${selectedYear === y
                  ? 'bg-indigo-600 text-white'
                  : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
              >{y}</button>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 ml-auto">
            <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {stats.completed}/{stats.total} hoàn thành
            </span>
            <div className={`w-24 h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`}>
              <div
                className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-indigo-500 to-green-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className={`text-sm font-bold ${progressPct >= 70 ? 'text-green-500' : progressPct >= 30 ? 'text-yellow-500' : isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {progressPct}%
            </span>
          </div>
        </div>

        {/* Empty progress bar */}
        {stats.total === 0 && (
          <p className={`text-xs italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Năm {selectedYear} — Click vào từng dòng để bắt đầu điền ước muốn
          </p>
        )}
      </div>

      {/* List */}
      <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-white shadow-sm'}`}>
        {/* Column header */}
        <div className={`px-4 py-2 border-b flex items-center justify-between ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
          <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            🗓 Bucket List {selectedYear}
          </span>
          <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{items.length} mục</span>
        </div>

        <div className="divide-y divide-slate-700/30">
          {items.map((item, idx) => (
            <BucketListItem
              key={item.id}
              item={item}
              isDark={isDark}
              index={idx}
              onUpdate={(id, data) => updateItem(selectedYear, id, data)}
              onDelete={(id) => deleteItem(selectedYear, id)}
              onToggle={(id) => toggleCompleted(selectedYear, id)}
            />
          ))}
        </div>

        {/* Add more button */}
        <div className={`px-4 py-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <button
            onClick={() => addItem(selectedYear)}
            className={`w-full py-2 rounded-xl text-sm font-medium transition-colors border border-dashed ${isDark ? 'border-slate-600 text-slate-400 hover:border-indigo-500 hover:text-indigo-400' : 'border-slate-300 text-slate-500 hover:border-indigo-400 hover:text-indigo-600'}`}
          >
            + Thêm mục
          </button>
        </div>
      </div>
    </div>
  )
}
