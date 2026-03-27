import { useState, useMemo } from 'react'
import { useAuth } from '../features/auth/AuthContext'
import { useTheme } from '../features/theme/ThemeContext'
import DreamBoardCard from '../features/dreamboard/DreamBoardCard'
import AddDreamModal from '../features/dreamboard/AddDreamModal'

export default function DreamBoardPage({ items, loading, addItem, updateItem, deleteItem, toggleAchieved }) {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [filterArea, setFilterArea] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  // Lazy import AREAS to avoid circular — re-use from cache
  const AREA_OPTIONS = [
    { id: 'health', name: 'Sức khỏe', color: '#22c55e' },
    { id: 'career', name: 'Sự nghiệp', color: '#3b82f6' },
    { id: 'finance', name: 'Tài chính', color: '#ec4899' },
    { id: 'family', name: 'Gia đình', color: '#eab308' },
    { id: 'growth', name: 'Bản thân', color: '#832178' },
    { id: 'recreation', name: 'Giải trí', color: '#f97316' },
    { id: 'spiritual', name: 'Tâm linh', color: '#06b6d4' },
    { id: 'contribution', name: 'Đóng góp', color: '#8b6c5c' },
  ]

  const filtered = useMemo(() => {
    return items.filter(item => {
      if (filterArea !== 'all' && item.area_id !== filterArea) return false
      if (filterStatus !== 'all' && item.status !== filterStatus) return false
      return true
    })
  }, [items, filterArea, filterStatus])

  const achieved = items.filter(i => i.status === 'achieved').length

  const handleSave = (data) => {
    if (editItem) {
      updateItem(editItem.id, data)
    } else {
      addItem(data)
    }
    setEditItem(null)
  }

  const handleEdit = (item) => {
    setEditItem(item)
    setShowModal(true)
  }

  const handleClose = () => {
    setShowModal(false)
    setEditItem(null)
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              🌟 Dream Board
            </h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Bảng ước mơ trực quan — hình ảnh hoá những điều bạn khao khát
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-3">
            <div className={`px-4 py-2 rounded-xl text-center ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200 shadow-sm'}`}>
              <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{items.length}</div>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tổng ước mơ</div>
            </div>
            <div className={`px-4 py-2 rounded-xl text-center ${isDark ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-200'}`}>
              <div className="text-xl font-bold text-yellow-500">{achieved}</div>
              <div className={`text-xs ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>Đã đạt được</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className={`mb-5 p-3 rounded-xl border flex flex-wrap gap-3 items-center ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
        {/* Status filter */}
        <div className={`flex rounded-lg overflow-hidden border text-xs ${isDark ? 'border-slate-600' : 'border-slate-300'}`}>
          {[['all', 'Tất cả'], ['active', '✨ Đang theo đuổi'], ['achieved', '🏆 Đã đạt']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilterStatus(val)}
              className={`px-3 py-1.5 font-medium transition-colors ${filterStatus === val
                ? 'bg-indigo-600 text-white'
                : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
            >{label}</button>
          ))}
        </div>

        {/* Area filter */}
        <select
          value={filterArea}
          onChange={e => setFilterArea(e.target.value)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${isDark ? 'bg-slate-700 text-white border-slate-600' : 'bg-white text-slate-700 border-slate-300'}`}
        >
          <option value="all">Tất cả lĩnh vực</option>
          {AREA_OPTIONS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>

        <span className={`ml-auto text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {filtered.length} / {items.length} ước mơ
        </span>
      </div>

      {/* Loading */}
      {loading && (
        <div className={`text-center py-16 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          <div className="text-4xl mb-3 animate-spin">⏳</div>
          <p>Đang tải...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && items.length === 0 && (
        <div className={`text-center py-16 rounded-2xl border ${isDark ? 'border-slate-700 bg-slate-800/30' : 'border-slate-200 bg-slate-50'}`}>
          <div className="text-6xl mb-4">🌠</div>
          <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Bảng ước mơ của bạn còn trống</h3>
          <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Hãy thêm những điều bạn khao khát để luôn nhìn thấy đích đến</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors"
          >
            ✨ Thêm ước mơ đầu tiên
          </button>
        </div>
      )}

      {/* No results from filter */}
      {!loading && items.length > 0 && filtered.length === 0 && (
        <div className={`text-center py-12 rounded-2xl border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="text-4xl mb-3">🔍</div>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Không tìm thấy ước mơ phù hợp với bộ lọc</p>
        </div>
      )}

      {/* Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(item => (
            <DreamBoardCard
              key={item.id}
              item={item}
              isDark={isDark}
              onEdit={handleEdit}
              onDelete={deleteItem}
              onToggleAchieved={toggleAchieved}
            />
          ))}
        </div>
      )}

      {/* FAB */}
      {items.length > 0 && (
        <button
          onClick={() => setShowModal(true)}
          className="fixed bottom-20 right-6 md:bottom-8 md:right-8 w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-500 hover:shadow-indigo-500/40 hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center text-2xl z-30"
          title="Thêm ước mơ"
        >
          +
        </button>
      )}

      {/* Modal */}
      <AddDreamModal
        isOpen={showModal}
        onClose={handleClose}
        onSave={handleSave}
        isDark={isDark}
        editItem={editItem}
        userId={user?.id}
      />
    </div>
  )
}
