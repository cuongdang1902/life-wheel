import { useState, useRef } from 'react'
import { AREAS } from '../wheel/LifeWheel'
import { uploadDreamImage } from './imageUtils'

export default function AddDreamModal({ isOpen, onClose, onSave, isDark, editItem = null, userId }) {
  const [title, setTitle] = useState(editItem?.title || '')
  const [imageUrl, setImageUrl] = useState(editItem?.image_url || '')
  const [affirmation, setAffirmation] = useState(editItem?.affirmation || '')
  const [areaId, setAreaId] = useState(editItem?.area_id || '')
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(editItem?.image_url || '')
  const fileRef = useRef(null)

  if (!isOpen) return null

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Local preview
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    if (userId) {
      setUploading(true)
      const url = await uploadDreamImage(file, userId)
      setUploading(false)
      if (url) {
        setImageUrl(url)
        URL.revokeObjectURL(objectUrl)
        setPreview(url)
      }
    } else {
      // No auth: store base64 for localStorage fallback
      const reader = new FileReader()
      reader.onload = (ev) => {
        setImageUrl(ev.target.result)
        setPreview(ev.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    if (!title.trim()) return
    onSave({ title: title.trim(), image_url: imageUrl, affirmation: affirmation.trim(), area_id: areaId })
    onClose()
  }

  const selectedArea = AREAS.find(a => a.id === areaId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className={`relative w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {editItem ? '✏️ Chỉnh sửa ước mơ' : '🌟 Thêm ước mơ mới'}
          </h2>
          <button onClick={onClose} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>✕</button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Image */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Hình ảnh</label>
            {/* Preview */}
            {preview && (
              <div className="mb-3 rounded-xl overflow-hidden h-40 bg-slate-900">
                <img src={preview} alt="preview" className="w-full h-full object-cover" onError={() => setPreview('')} />
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={imageUrl}
                onChange={e => { setImageUrl(e.target.value); setPreview(e.target.value) }}
                placeholder="Paste URL ảnh..."
                className={`flex-1 px-3 py-2 rounded-xl border text-sm transition-colors ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500' : 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500'} outline-none`}
              />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className={`px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${isDark ? 'bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600' : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'}`}
              >
                {uploading ? '⏳' : '📁 Upload'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Tiêu đề <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ước mơ của bạn..."
              className={`w-full px-3 py-2 rounded-xl border text-sm ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500' : 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500'} outline-none transition-colors`}
            />
          </div>

          {/* Affirmation */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Lời khẳng định</label>
            <textarea
              value={affirmation}
              onChange={e => setAffirmation(e.target.value)}
              placeholder="Tôi xứng đáng với điều này..."
              rows={2}
              className={`w-full px-3 py-2 rounded-xl border text-sm resize-none ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500' : 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500'} outline-none transition-colors`}
            />
          </div>

          {/* Area */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Lĩnh vực</label>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => setAreaId('')}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors ${!areaId ? (isDark ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-indigo-600 border-indigo-500 text-white') : (isDark ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-white border-slate-200 text-slate-600')}`}
              >Tất cả</button>
              {AREAS.map(area => (
                <button
                  key={area.id}
                  onClick={() => setAreaId(area.id)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${areaId === area.id ? 'text-white border-transparent' : (isDark ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-white border-slate-200 text-slate-600')}`}
                  style={areaId === area.id ? { backgroundColor: area.color, borderColor: area.color } : {}}
                >
                  {area.name.split(' ')[0]}
                </button>
              ))}
            </div>
            {selectedArea && (
              <p className="text-xs mt-2" style={{ color: selectedArea.color }}>● {selectedArea.name}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex justify-end gap-3 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || uploading}
            className="px-5 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {editItem ? '💾 Cập nhật' : '✨ Thêm ước mơ'}
          </button>
        </div>
      </div>
    </div>
  )
}
