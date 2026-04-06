import { useState, useRef, useEffect } from 'react'

export default function NotificationBell({ pendingInvites, isDark, onAccept, onReject }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const count = pendingInvites.length

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const FEATURE_LABEL = { wheel: '🎡 Life Wheel', dreamboard: '🌟 Dream Board', bucketlist: '📋 Bucket List' }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(prev => !prev)}
        className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}
        title="Thông báo"
      >
        🔔
        {count > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className={`absolute right-0 top-full mt-2 w-80 rounded-2xl border shadow-2xl z-50 overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className={`px-4 py-3 border-b text-sm font-semibold ${isDark ? 'border-slate-700 text-slate-200' : 'border-slate-200 text-slate-700'}`}>
            🔔 Lời mời chia sẻ {count > 0 && <span className="ml-1 text-red-400">({count})</span>}
          </div>

          {count === 0 ? (
            <div className={`px-4 py-6 text-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Không có lời mời nào
            </div>
          ) : (
            <div className="divide-y divide-slate-700/30 max-h-72 overflow-y-auto">
              {pendingInvites.map(invite => {
                const fromName = invite.owner?.raw_user_meta_data?.full_name || invite.owner?.email || '...'
                return (
                  <div key={invite.id} className={`px-4 py-3 ${isDark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'}`}>
                    <p className={`text-sm font-medium mb-0.5 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                      👤 {fromName}
                    </p>
                    <p className={`text-xs mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      muốn chia sẻ {FEATURE_LABEL[invite.feature] || invite.feature} với bạn
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { onAccept(invite.id); }}
                        className="px-3 py-1 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-500 transition-colors"
                      >✓ Chấp nhận</button>
                      <button
                        onClick={() => { onReject(invite.id); }}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >✕ Từ chối</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
