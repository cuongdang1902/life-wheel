import { useState } from 'react'

const FEATURES = [
  { id: 'wheel', label: '🎡 Life Wheel', desc: 'Biểu đồ vòng xoay cuộc sống' },
  { id: 'dreamboard', label: '🌟 Dream Board', desc: 'Bảng ước mơ trực quan' },
  { id: 'bucketlist', label: '📋 Bucket List', desc: 'Danh sách mong muốn theo năm' },
]

export default function ShareModal({ isOpen, onClose, isDark, myShares, onSendInvite, onRevoke }) {
  const [email, setEmail] = useState('')
  const [selectedFeatures, setSelectedFeatures] = useState(['wheel', 'dreamboard', 'bucketlist'])
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null) // { success, error }

  if (!isOpen) return null

  const toggleFeature = (fid) => {
    setSelectedFeatures(prev => prev.includes(fid) ? prev.filter(f => f !== fid) : [...prev, fid])
  }

  const handleSend = async () => {
    if (!email.trim() || selectedFeatures.length === 0) return
    setSending(true)
    setResult(null)
    const res = await onSendInvite(email.trim().toLowerCase(), selectedFeatures)
    setSending(false)
    setResult(res)
    if (res.success) setEmail('')
  }

  // Group myShares by recipient
  const grouped = myShares.reduce((acc, s) => {
    const key = s.shared_with_id
    if (!acc[key]) acc[key] = { id: key, recipient: s.recipient, shares: [] }
    acc[key].shares.push(s)
    return acc
  }, {})

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>👥 Chia sẻ với bạn bè</h2>
          <button onClick={onClose} className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>✕</button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Invite form */}
          <div>
            <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Mời bạn bè</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email của bạn bè..."
              className={`w-full px-3 py-2 rounded-xl border text-sm mb-3 ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500' : 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500'} outline-none transition-colors`}
            />
            {/* Feature checkboxes */}
            <div className="space-y-2 mb-4">
              {FEATURES.map(f => (
                <label key={f.id} className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer border transition-colors ${selectedFeatures.includes(f.id)
                  ? isDark ? 'bg-indigo-500/10 border-indigo-500/50' : 'bg-indigo-50 border-indigo-300'
                  : isDark ? 'border-slate-700 hover:bg-slate-700/50' : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                  <input
                    type="checkbox"
                    checked={selectedFeatures.includes(f.id)}
                    onChange={() => toggleFeature(f.id)}
                    className="w-4 h-4 rounded text-indigo-500 focus:ring-indigo-500"
                  />
                  <div>
                    <div className={`text-sm font-medium ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{f.label}</div>
                    <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{f.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            {result && (
              <p className={`text-sm mb-3 ${result.error ? 'text-red-400' : 'text-green-400'}`}>
                {result.error || '✅ Đã gửi lời mời thành công!'}
              </p>
            )}

            <button
              onClick={handleSend}
              disabled={!email.trim() || selectedFeatures.length === 0 || sending}
              className="w-full py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? '⏳ Đang gửi...' : '📨 Gửi lời mời'}
            </button>
          </div>

          {/* Current shares */}
          {Object.values(grouped).length > 0 && (
            <div>
              <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Đã chia sẻ với</label>
              <div className="space-y-3">
                {Object.values(grouped).map(group => {
                  const name = group.recipient?.full_name || group.recipient?.email || '...'
                  return (
                    <div key={group.id} className={`p-3 rounded-xl border ${isDark ? 'border-slate-700 bg-slate-700/30' : 'border-slate-200 bg-slate-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>👤 {name}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {group.shares.map(s => (
                          <span key={s.id} className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${s.status === 'accepted'
                            ? isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-600'
                            : s.status === 'rejected'
                              ? isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-600'
                              : isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-50 text-yellow-600'
                            }`}>
                            {FEATURES.find(f => f.id === s.feature)?.label}
                            <span className="opacity-70">{s.status === 'accepted' ? '✓' : s.status === 'rejected' ? '✗' : '⏳'}</span>
                            <button onClick={() => onRevoke(s.id)} className="hover:opacity-100 opacity-50 ml-1">✕</button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
