import { useState, useCallback, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'

// Features
import LifeWheel, { AREAS } from './features/wheel/LifeWheel'
import ExportModal from './features/wheel/ExportModal'
import SaveSnapshotModal from './features/snapshots/SaveSnapshotModal'
import AuthModal from './features/auth/AuthModal'

// Pages
import HomePage from './pages/HomePage'
import SnapshotsPage from './pages/SnapshotsPage'
import GoalsPage from './pages/GoalsPage'
import DashboardPage from './pages/DashboardPage'

// Hooks
import useSnapshots from './features/snapshots/useSnapshots'
import useGoals from './features/goals/useGoals'
import useReminder from './features/reminder/useReminder'
import { useTheme } from './features/theme/ThemeContext'
import { useAuth } from './features/auth/AuthContext'

import './App.css'

function App() {
  const { isDark } = useTheme()
  const { user } = useAuth()

  const [scores, setScores] = useState(
    AREAS.reduce((acc, area) => ({ ...acc, [area.id]: 5 }), {})
  )

  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const [compareEnabled, setCompareEnabled] = useState(false)
  const [selectedSnapshotId, setSelectedSnapshotId] = useState(null)
  const [toast, setToast] = useState(null)

  const snapshotsHook = useSnapshots()
  const goalsHook = useGoals()
  const reminderHook = useReminder()

  const comparisonScores = useCallback(() => {
    if (!compareEnabled) return null
    if (selectedSnapshotId) {
      const snapshot = snapshotsHook.getSnapshotById(selectedSnapshotId)
      if (snapshot) return snapshot.scores
    }
    const latest = snapshotsHook.getLatestSnapshot()
    return latest?.scores || null
  }, [compareEnabled, selectedSnapshotId, snapshotsHook])

  // Auto-clear selectedSnapshotId nếu nó không còn tồn tại
  useEffect(() => {
    if (selectedSnapshotId && !snapshotsHook.getSnapshotById(selectedSnapshotId)) {
      setSelectedSnapshotId(null)
    }
  }, [snapshotsHook.snapshots, selectedSnapshotId, snapshotsHook])

  const handleScoreChange = (areaId, value) => {
    setScores(prev => ({ ...prev, [areaId]: Number(value) }))
  }

  const handleSaveSnapshot = (period) => {
    snapshotsHook.addSnapshot(scores, period)
    showToast('✅ Đã lưu snapshot thành công!')
  }

  const handleDeleteSnapshot = (id) => {
    snapshotsHook.deleteSnapshot(id)
    showToast('🗑️ Đã xóa snapshot')
  }

  const handleDeleteByPeriod = (period) => {
    snapshotsHook.deleteByPeriod(period)
    showToast(`🗑️ Đã xóa tất cả snapshot (${period})`)
  }

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <>
      <AppLayout onOpenAuth={() => setShowAuthModal(true)}>
        <Routes>
          <Route path="/" element={
            <HomePage
              scores={scores}
              handleScoreChange={handleScoreChange}
              comparisonScores={comparisonScores}
              compareEnabled={compareEnabled}
              setCompareEnabled={setCompareEnabled}
              selectedSnapshotId={selectedSnapshotId}
              snapshotsCount={snapshotsHook.snapshots.length}
              onSaveSnapshot={() => setShowSaveModal(true)}
              onExport={() => setShowExportModal(true)}
              isDark={isDark}
            />
          } />
          <Route path="/snapshots" element={
            <SnapshotsPage
              snapshots={snapshotsHook.snapshots}
              onDelete={handleDeleteSnapshot}
              onDeleteByPeriod={handleDeleteByPeriod}
              selectedSnapshotId={selectedSnapshotId}
              onSelectSnapshot={setSelectedSnapshotId}
              compareEnabled={compareEnabled}
              onToggleCompare={setCompareEnabled}
              isDark={isDark}
              reminder={reminderHook}
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
        </Routes>
      </AppLayout>

      {/* Modals keeping global state */}
      <SaveSnapshotModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveSnapshot}
        isDark={isDark}
      />

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
