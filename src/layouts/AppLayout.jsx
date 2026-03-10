import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../features/theme/ThemeContext'
import { useAuth } from '../features/auth/AuthContext'
import ThemeToggle from '../features/theme/ThemeToggle'
import { useState, useRef, useEffect } from 'react'

// Bottom Navigation items
const NAV_ITEMS = [
    { to: '/', icon: '🎡', label: 'Wheel' },
    { to: '/snapshots', icon: '📊', label: 'Snapshots' },
    { to: '/goals', icon: '🎯', label: 'Goals' },
    { to: '/dashboard', icon: '📈', label: 'Dashboard' },
]

export default function AppLayout({ children, onOpenAuth }) {
    const { isDark } = useTheme()
    const { user, signOut } = useAuth()
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const dropdownRef = useRef(null)
    const navigate = useNavigate()

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handleSignOut = async () => {
        await signOut()
        setDropdownOpen(false)
        navigate('/')
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDark
            ? 'bg-slate-900 text-white'
            : 'bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 text-slate-900'
            }`}>

            {/* Header */}
            <header className={`sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 py-3 border-b backdrop-blur-md ${isDark ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-slate-200 shadow-sm'
                }`}>

                {/* Logo */}
                <div className="flex items-center gap-2 font-bold text-lg">
                    <span>🎡</span>
                    <span className={`bg-clip-text text-transparent bg-gradient-to-r ${isDark ? 'from-indigo-400 to-purple-400' : 'from-indigo-600 to-purple-600'
                        }`}>Life Wheel</span>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-3">
                    <ThemeToggle />

                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen(prev => !prev)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                                <img
                                    src={user.user_metadata?.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${user.email}`}
                                    alt="Avatar"
                                    className="w-8 h-8 rounded-full border-2 border-indigo-400"
                                />
                                <span className={`text-sm font-medium hidden md:block ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                                </span>
                                <span className="text-xs opacity-50">▾</span>
                            </button>

                            {dropdownOpen && (
                                <div className={`absolute right-0 mt-2 w-48 rounded-xl py-1 shadow-xl border z-50 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                                    }`}>
                                    <div className={`px-4 py-2 text-xs border-b ${isDark ? 'text-slate-400 border-slate-700' : 'text-slate-500 border-slate-100'}`}>
                                        {user.email}
                                    </div>
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                    >
                                        🚪 Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={onOpenAuth}
                            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${isDark
                                ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
                                }`}
                        >
                            🔐 Đăng nhập
                        </button>
                    )}
                </div>
            </header>

            {/* Main Content & Sidebar Wrapper */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row">

                {/* Desktop Sidebar Navigation (Planned) */}
                <aside className={`hidden md:flex flex-col w-64 p-6 pr-8 border-r min-h-[calc(100vh-65px)] sticky top-[65px] ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                    <div className="space-y-2">
                        {NAV_ITEMS.map(item => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.to === '/'}
                                className={({ isActive }) =>
                                    `flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all ${isActive
                                        ? isDark ? 'text-indigo-400 bg-indigo-500/10 shadow-sm' : 'text-indigo-600 bg-indigo-50 shadow-sm'
                                        : isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                    }`
                                }
                            >
                                <span className="text-2xl">{item.icon}</span>
                                <span className="text-base">{item.label}</span>
                            </NavLink>
                        ))}
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-6 max-w-5xl">
                    {children}
                </main>
            </div>

            {/* Bottom Navigation (Mobile) */}
            <nav className={`fixed bottom-0 left-0 right-0 z-40 md:hidden flex items-center justify-around px-2 py-2 border-t backdrop-blur-md ${isDark ? 'bg-slate-900/90 border-slate-700' : 'bg-white/90 border-slate-200 shadow-lg'
                }`}>
                {NAV_ITEMS.map(item => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/'}
                        className={({ isActive }) =>
                            `flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${isActive
                                ? isDark ? 'text-indigo-400 bg-indigo-500/10' : 'text-indigo-600 bg-indigo-50'
                                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
                            }`
                        }
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

        </div>
    )
}
