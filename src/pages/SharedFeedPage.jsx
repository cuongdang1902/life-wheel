import { useState } from 'react'
import { useTheme } from '../features/theme/ThemeContext'
import ShareModal from '../features/sharing/ShareModal'
import DreamBoardCard from '../features/dreamboard/DreamBoardCard'
import BucketListItem from '../features/bucketlist/BucketListItem'
import NavIcon from '../shared/components/NavIcon'

const FEATURE_LABELS = {
  wheel:      'Life Wheel',
  dreamboard: 'Dream Board',
  bucketlist: 'Bucket List',
}

const TAB_ICONS = { wheel: 'wheel', dreamboard: 'dreams', bucketlist: 'bucketlist' }

export default function SharedFeedPage({
  sharingHook,
  // Read-only data loaders for friends' content
  getFriendSnapshots,
  getFriendDreams,
  getFriendBucketList,
}) {
  const { isDark } = useTheme()
  const { friendsSharedWithMe, myShares, pendingInvites, sendInvite, acceptInvite, rejectInvite, revokeShare, userId } = sharingHook
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [activeTab, setActiveTab] = useState('wheel')
  const [showShareModal, setShowShareModal] = useState(false)

  const friend = friendsSharedWithMe.find(f => f.id === selectedFriend)
  const availableTabs = friend?.features || []

  // Placeholder for friend data (in a real implementation, fetch from Supabase with RLS)
  const friendName = friend?.owner?.raw_user_meta_data?.full_name || friend?.owner?.email || '...'

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className={`text-2xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            <NavIcon id="friends" size="w-7 h-7" /> Bạn bè
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Xem Life Wheel, Dream Board và Bucket List của bạn bè
          </p>
        </div>
        {userId && (
          <button
            onClick={() => setShowShareModal(true)}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
          >
            📨 Chia sẻ của tôi
          </button>
        )}
      </div>

      {!userId ? (
        <div className={`text-center py-16 rounded-2xl border ${isDark ? 'border-slate-700 bg-slate-800/30' : 'border-slate-200 bg-slate-50'}`}>
          <div className="text-5xl mb-4">🔐</div>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Đăng nhập để xem nội dung bạn bè đã chia sẻ</p>
        </div>
      ) : friendsSharedWithMe.length === 0 ? (
        <div className={`text-center py-16 rounded-2xl border ${isDark ? 'border-slate-700 bg-slate-800/30' : 'border-slate-200 bg-slate-50'}`}>
          <div className="text-6xl mb-4">🌐</div>
          <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Chưa ai chia sẻ với bạn</h3>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Bạn bè chia sẻ Life Wheel, Dream Board hoặc Bucket List → nội dung sẽ xuất hiện ở đây</p>
        </div>
      ) : (
        <div className="flex gap-5 flex-col md:flex-row">
          {/* Friend list sidebar */}
          <div className={`rounded-2xl border overflow-hidden w-full md:w-56 flex-shrink-0 ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white shadow-sm'}`}>
            <div className={`px-4 py-3 border-b text-xs font-semibold uppercase tracking-wider ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
              Bạn bè ({friendsSharedWithMe.length})
            </div>
            <div className="divide-y divide-slate-700/30">
              {friendsSharedWithMe.map(f => {
                const name = f.owner?.raw_user_meta_data?.full_name || f.owner?.email || '...'
                const isSelected = selectedFriend === f.id
                return (
                  <button
                    key={f.id}
                    onClick={() => { setSelectedFriend(f.id); setActiveTab(f.features[0] || 'wheel') }}
                    className={`w-full text-left px-4 py-3 transition-colors ${isSelected
                      ? isDark ? 'bg-indigo-500/15 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                      : isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                  >
                    <div className="text-sm font-medium truncate">👤 {name}</div>
                    <div className="flex items-center gap-1 text-xs mt-0.5">
                      {f.features.map(fid => (
                        <NavIcon key={fid} id={TAB_ICONS[fid]} size="w-3.5 h-3.5" />
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content panel */}
          <div className="flex-1 min-w-0">
            {!selectedFriend ? (
              <div className={`text-center py-16 rounded-2xl border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>← Chọn bạn bè để xem nội dung</p>
              </div>
            ) : (
              <>
                {/* Tab bar */}
                <div className={`flex rounded-xl overflow-hidden border mb-4 w-fit ${isDark ? 'border-slate-600' : 'border-slate-300'}`}>
                  {availableTabs.map(fid => (
                    <button
                      key={fid}
                      onClick={() => setActiveTab(fid)}
                      className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${activeTab === fid
                        ? 'bg-indigo-600 text-white'
                        : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                      <NavIcon id={TAB_ICONS[fid]} size="w-4 h-4" />
                      {FEATURE_LABELS[fid]}
                    </button>
                  ))}
                </div>

                {/* Read-only content label */}
                <div className={`px-4 py-2 rounded-xl text-xs mb-4 flex items-center gap-1.5 ${isDark ? 'bg-slate-700/50 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                  <NavIcon id={TAB_ICONS[activeTab]} size="w-3.5 h-3.5" /> Bạn đang xem nội dung của <strong>{friendName}</strong> — chỉ đọc
                </div>

                {/* Placeholder content */}
                <div className={`text-center py-12 rounded-2xl border ${isDark ? 'border-slate-700 border-dashed' : 'border-slate-200 border-dashed'}`}>
                  <div className="flex justify-center mb-3">
                    <NavIcon id={TAB_ICONS[activeTab]} size="w-10 h-10" />
                  </div>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Đang tải {FEATURE_LABELS[activeTab]} của {friendName}...
                  </p>
                  <p className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    (Cần cấu hình Supabase RLS + email column trên profiles để hoàn thiện)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Share management modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        isDark={isDark}
        myShares={myShares}
        onSendInvite={sendInvite}
        onRevoke={revokeShare}
      />
    </div>
  )
}

