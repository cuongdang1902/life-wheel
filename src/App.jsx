import { useState, useCallback } from 'react'
import { Routes, Route } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'

// Features
import { AREAS } from './features/wheel/LifeWheel'
import ExportModal from './features/wheel/ExportModal'
import AuthModal from './features/auth/AuthModal'

// Pages
import HomePage from './pages/HomePage'
import ChartsPage from './pages/ChartsPage'
import GoalsPage from './pages/GoalsPage'
import DashboardPage from './pages/DashboardPage'
import DreamBoardPage from './pages/DreamBoardPage'
import BucketListPage from './pages/BucketListPage'
import SharedFeedPage from './pages/SharedFeedPage'
import YearReviewPage from './features/yearreview/YearReviewPage'

// Hooks
import useSnapshots from './features/snapshots/useSnapshots'
import useGoals from './features/goals/useGoals'
import useReminder from './features/reminder/useReminder'
import useDreamBoard from './features/dreamboard/useDreamBoard'
import useBucketList from './features/bucketlist/useBucketList'
import useSharing from './features/sharing/useSharing'
import useYearReview from './features/yearreview/useYearReview'
import { useTheme } from './features/theme/ThemeContext'
import { useAuth } from './features/auth/AuthContext'

import './App.css'

function App() {
  const { isDark } = useTheme()
  const { user } = useAuth()

  // scores is kept here only for ExportModal — synced via onScoresChange from HomePage
  const [scores, setScores] = useState(
    AREAS.reduce((acc, area) => ({ ...acc, [area.id]: 5 }), {})
  )

  const [showExportModal, setShowExportModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [toast, setToast] = useState(null)

  const snapshotsHook = useSnapshots()
  const goalsHook = useGoals()
  const reminderHook = useReminder()
  const dreamBoardHook = useDreamBoard()
  const bucketListHook = useBucketList()
  const sharingHook = useSharing()
  const yearReviewHook = useYearReview()

  const handleDeleteSnapshot = (id) => {
    snapshotsHook.deleteSnapshot(id)
    showToast('🗑️ Đã xóa snapshot')
  }

  const handleDeleteByPeriod = (period) => {
    snapshotsHook.deleteByPeriod(period)
    showToast(`🗑️ Đã xóa snapshot (${period})`)
  }

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <>
      <AppLayout onOpenAuth={() => setShowAuthModal(true)} sharingHook={sharingHook}>
        <Routes>
          <Route path="/" element={
            <HomePage
              snapshotsHook={snapshotsHook}
              onScoresChange={setScores}
              onExport={() => setShowExportModal(true)}
              isDark={isDark}
            />
          } />
          <Route path="/charts" element={
            <ChartsPage
              snapshots={snapshotsHook.snapshots}
              onDelete={handleDeleteSnapshot}
              onDeleteByPeriod={handleDeleteByPeriod}
            />
          } />
          <Route path="/goals" element={
            <GoalsPage
              {...goalsHook}
              isDark={isDark}
            />
          } />
          <Route path="/dashboard" element={
            <DashboardPage
              getGoal={goalsHook.getGoal}
              toggleTask={goalsHook.toggleTask}
              getProgress={goalsHook.getProgress}
              isDark={isDark}
            />
          } />
          <Route path="/dream-board" element={
            <DreamBoardPage
              {...dreamBoardHook}
              isDark={isDark}
            />
          } />
          <Route path="/bucket-list" element={
            <BucketListPage
              {...bucketListHook}
              isDark={isDark}
            />
          } />
          <Route path="/friends" element={
            <SharedFeedPage
              sharingHook={sharingHook}
              isDark={isDark}
            />
          } />
          <Route path="/year-review" element={
            <YearReviewPage
              isDark={isDark}
              useYearReviewHook={yearReviewHook}
            />
          } />
        </Routes>
      </AppLayout>

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        scores={scores}
        isDark={isDark}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => showToast('✅ Đăng nhập thành công!')}
        isDark={isDark}
      />

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg border z-50 animate-pulse ${isDark
          ? 'bg-slate-700 border-slate-600 text-white'
          : 'bg-white border-slate-200 text-slate-800'
          }`}>
          {toast}
        </div>
      )}
    </>
  )
}

export default App
