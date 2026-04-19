import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import LifeWheel, { AREAS } from '../features/wheel/LifeWheel'

const now = new Date()
const CUR_YEAR = now.getFullYear()
const CUR_MONTH = now.getMonth() + 1

const YEARS = Array.from({ length: 21 }, (_, i) => 2022 + i) // 2022–2042
const MONTH_NAMES = ['', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12']
const DEFAULT_SCORES = AREAS.reduce((acc, a) => ({ ...acc, [a.id]: 5 }), {})

export default function HomePage({ snapshotsHook, onScoresChange, onExport, isDark }) {
    const [selectedYear, setSelectedYear] = useState(CUR_YEAR)
    const [selectedMonth, setSelectedMonth] = useState(CUR_MONTH)
    const [scores, setScores] = useState(DEFAULT_SCORES)
    const [savedIndicator, setSavedIndicator] = useState(false)
    const debounceRef = useRef(null)
    const currentMkRef = useRef(null)            // tracks current month key
    const snapshotsHookRef = useRef(snapshotsHook) // always points to latest hook (for use in timeouts)
    useEffect(() => { snapshotsHookRef.current = snapshotsHook }, [snapshotsHook])
    const pendingSaveRef = useRef(null) // { scores, year, month } — pending debounce data

    // Flush any pending save immediately (called before switching months)
    const flushPendingSave = useCallback(async () => {
        if (!pendingSaveRef.current) return
        const { scores: s, year, month } = pendingSaveRef.current
        pendingSaveRef.current = null
        clearTimeout(debounceRef.current)
        debounceRef.current = null
        await snapshotsHookRef.current?.upsertMonthlySnapshot?.(s, year, month)
    }, [])

    // Effect: sync scores from snapshot whenever month/year changes or snapshots data arrives
    useEffect(() => {
        const mk = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`
        const prevMk = currentMkRef.current
        currentMkRef.current = mk

        // Flush pending save from previous month before loading new month
        if (prevMk && prevMk !== mk && pendingSaveRef.current) {
            flushPendingSave()
        }

        const snap = snapshotsHook?.getSnapshotByMonth?.(mk)
        const newScores = snap ? { ...snap.scores } : { ...DEFAULT_SCORES }
        setScores(newScores)
        onScoresChange?.(newScores)
    }, [selectedYear, selectedMonth, snapshotsHook?.snapshots, onScoresChange, flushPendingSave])

    const handleScoreChange = useCallback((areaId, value) => {
        const newScores = { ...scores, [areaId]: Number(value) }
        setScores(newScores)
        onScoresChange?.(newScores)

        // Track pending save data so it can be flushed on month switch
        pendingSaveRef.current = { scores: newScores, year: selectedYear, month: selectedMonth }

        // Debounced auto-save
        clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(async () => {
            pendingSaveRef.current = null  // no longer pending
            await snapshotsHookRef.current?.upsertMonthlySnapshot?.(newScores, selectedYear, selectedMonth)
            setSavedIndicator(true)
            setTimeout(() => setSavedIndicator(false), 1500)
        }, 800)
    }, [scores, selectedYear, selectedMonth, onScoresChange])

    const handleManualSave = async () => {
        clearTimeout(debounceRef.current)
        await snapshotsHookRef.current?.upsertMonthlySnapshot?.(scores, selectedYear, selectedMonth)
        setSavedIndicator(true)
        setTimeout(() => setSavedIndicator(false), 1500)
    }

    const avg = (Object.values(scores).reduce((a, b) => a + b, 0) / 8).toFixed(1)

    return (
        <div className="w-full">
            {/* Month/Year Selector */}
            <div className={`mb-5 px-5 py-3 rounded-2xl border flex flex-wrap items-center gap-3 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Chấm điểm cho</span>

                {/* Month select */}
                <select
                    value={selectedMonth}
                    onChange={e => setSelectedMonth(Number(e.target.value))}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium border ${isDark ? 'bg-slate-700 text-white border-slate-600' : 'bg-white text-slate-700 border-slate-300'}`}
                >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                        <option key={m} value={m}>{MONTH_NAMES[m]}</option>
                    ))}
                </select>

                {/* Year select */}
                <select
                    value={selectedYear}
                    onChange={e => setSelectedYear(Number(e.target.value))}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium border ${isDark ? 'bg-slate-700 text-white border-slate-600' : 'bg-white text-slate-700 border-slate-300'}`}
                >
                    {YEARS.map(y => <option key={y} value={y}>Năm {y}</option>)}
                </select>

                {/* Save button + indicator */}
                <div className="ml-auto flex items-center gap-2">
                    <div className={`flex items-center gap-1.5 text-xs transition-opacity duration-300 ${savedIndicator ? 'opacity-100' : 'opacity-0'}`}>
                        <span className="text-green-500">✓</span>
                        <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Đã lưu</span>
                    </div>
                    <button
                        onClick={handleManualSave}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
                    >
                        Lưu
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 md:gap-8 items-start">
                {/* Wheel */}
                <div className={`lg:col-span-2 rounded-2xl p-4 md:p-6 flex items-center justify-center border transition-colors ${isDark
                    ? 'bg-slate-800/50 border-slate-700'
                    : 'bg-white/70 border-slate-200 shadow-xl backdrop-blur-sm'
                    }`}>
                    <LifeWheel scores={scores} isDark={isDark} />
                </div>

                {/* Sliders */}
                <div className={`rounded-2xl p-4 md:p-6 border transition-colors ${isDark
                    ? 'bg-slate-800/50 border-slate-700'
                    : 'bg-white/70 border-slate-200 shadow-xl backdrop-blur-sm'
                    }`}>
                    <h2 className={`text-lg md:text-xl font-semibold mb-4 md:mb-6 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        📊 Điểm số — {MONTH_NAMES[selectedMonth]}/{selectedYear}
                    </h2>
                    <div className="space-y-4 md:space-y-5">
                        {AREAS.map(area => (
                            <div key={area.id} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium flex items-center gap-2" style={{ color: area.color }}>
                                        <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full" style={{ backgroundColor: area.color }} />
                                        {area.name}
                                    </label>
                                    <span
                                        className="text-lg md:text-xl font-bold w-10 text-center rounded-lg py-0.5 md:py-1"
                                        style={{ backgroundColor: `${area.color}20`, color: area.color }}
                                    >
                                        {scores[area.id]}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    value={scores[area.id]}
                                    onChange={e => handleScoreChange(area.id, e.target.value)}
                                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                                    style={{
                                        background: `linear-gradient(to right, ${area.color} 0%, ${area.color} ${scores[area.id] * 10}%, ${isDark ? '#334155' : '#e2e8f0'} ${scores[area.id] * 10}%, ${isDark ? '#334155' : '#e2e8f0'} 100%)`
                                    }}
                                />
                                <div className={`flex justify-between text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    <span>0</span><span>5</span><span>10</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={`mt-6 pt-4 border-t text-center ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                        <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Điểm trung bình</div>
                        <div className="text-3xl font-bold text-indigo-500">{avg}</div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-6 md:mt-8 flex flex-wrap gap-3 md:gap-4 justify-center">
                <Link
                    to="/charts"
                    className={`px-5 md:px-6 py-2.5 md:py-3 rounded-xl font-medium transition-colors flex items-center gap-2 text-sm md:text-base ${isDark
                        ? 'bg-slate-700 hover:bg-slate-600 text-white'
                        : 'bg-white hover:bg-slate-50 text-slate-700 shadow-md border border-slate-200'
                        }`}
                >
                    📈 Xem biểu đồ
                </Link>
                <button
                    onClick={onExport}
                    className={`px-5 md:px-6 py-2.5 md:py-3 rounded-xl font-medium transition-colors flex items-center gap-2 text-sm md:text-base ${isDark
                        ? 'bg-slate-700 hover:bg-slate-600 text-white'
                        : 'bg-white hover:bg-slate-50 text-slate-700 shadow-md border border-slate-200'
                        }`}
                >
                    📥 Export
                </button>
            </div>

            <footer className={`text-center mt-10 md:mt-12 mb-10 text-xs md:text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                <p className="flex items-center justify-center gap-1.5">
                    <img src="/wheel-of-life.ico" alt="Life Wheel" className="w-4 h-4 object-contain inline-block" />
                    Life Wheel - Đánh giá cân bằng cuộc sống
                </p>
            </footer>
        </div>
    )
}
