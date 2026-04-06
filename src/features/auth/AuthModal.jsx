import { useState } from 'react'
import { supabase } from '../../shared/lib/supabase'

const MODE = { LOGIN: 'login', REGISTER: 'register' }

export default function AuthModal({ isOpen, onClose, isDark = true, onSuccess }) {
  const [mode, setMode] = useState(MODE.LOGIN)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  if (!isOpen) return null

  const clearForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setMessage({ type: '', text: '' })
  }

  const handleClose = () => {
    clearForm()
    onClose()
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    clearForm()
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })
    if (!email.trim() || !password) {
      setMessage({ type: 'error', text: 'Vui lòng nhập email và mật khẩu.' })
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (error) throw error
      setMessage({ type: 'success', text: 'Đăng nhập thành công!' })
      onSuccess?.(data)
      setTimeout(handleClose, 800)
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || 'Đăng nhập thất bại. Kiểm tra email và mật khẩu.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })
    if (!email.trim() || !password) {
      setMessage({ type: 'error', text: 'Vui lòng nhập email và mật khẩu.' })
      return
    }
    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Mật khẩu cần ít nhất 6 ký tự.' })
      return
    }
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp.' })
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: window.location.origin }
      })
      if (error) throw error
      setMessage({
        type: 'success',
        text: 'Đăng ký thành công! Kiểm tra email để xác thực (nếu bật).'
      })
      onSuccess?.(data)
      setTimeout(handleClose, 2000)
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || 'Đăng ký thất bại. Thử lại sau.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleContinueWithGoogle = async () => {
    setMessage({ type: '', text: '' })
    setGoogleLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}${window.location.pathname}` }
      })
      if (error) throw error
      // Trình duyệt sẽ chuyển sang Google, không cần đóng modal tại đây
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || 'Đăng nhập với Google thất bại. Thử lại sau.'
      })
    } finally {
      setGoogleLoading(false)
    }
  }

  const onSubmit = mode === MODE.LOGIN ? handleLogin : handleRegister
  const isLogin = mode === MODE.LOGIN

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`rounded-2xl max-w-md w-full border shadow-2xl ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          }`}
      >
        {/* Header + tabs */}
        <div className={`p-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => switchMode(MODE.LOGIN)}
              className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-colors ${isLogin
                  ? 'bg-indigo-600 text-white'
                  : isDark
                    ? 'bg-slate-700/50 text-slate-400 hover:text-white'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => switchMode(MODE.REGISTER)}
              className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-colors ${!isLogin
                  ? 'bg-indigo-600 text-white'
                  : isDark
                    ? 'bg-slate-700/50 text-slate-400 hover:text-white'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
            >
              Đăng ký
            </button>
          </div>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {isLogin ? '🔐 Đăng nhập' : '✨ Tạo tài khoản'}
          </h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {isLogin ? 'Nhập email và mật khẩu của bạn' : 'Điền thông tin để đăng ký'}
          </p>
        </div>

        {/* Continue with Google */}
        <div className="px-6 pt-2">
          <button
            type="button"
            onClick={handleContinueWithGoogle}
            disabled={googleLoading}
            className={`w-full py-3.5 px-4 rounded-xl font-medium flex items-center justify-center gap-3 transition-colors border ${isDark
                ? 'bg-slate-700/50 border-slate-600 text-white hover:bg-slate-700'
                : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {googleLoading ? 'Đang chuyển hướng...' : 'Continue with Google'}
          </button>
        </div>

        {/* Divider */}
        <div className="px-6 py-2 flex items-center gap-3">
          <span className={`flex-1 h-px ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`} />
          <span className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            hoặc
          </span>
          <span className={`flex-1 h-px ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`} />
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {message.text && (
            <div
              className={`rounded-xl px-4 py-3 text-sm ${message.type === 'error'
                  ? 'bg-red-500/20 text-red-200 border border-red-500/40'
                  : 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40'
                }`}
            >
              {message.text}
            </div>
          )}

          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500 ${isDark
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                  : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                }`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500 ${isDark
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                  : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                }`}
            />
          </div>

          {!isLogin && (
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500 ${isDark
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                  }`}
              />
            </div>
          )}

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className={`flex-1 py-3 rounded-xl font-medium transition-colors ${isDark
                  ? 'bg-slate-600 hover:bg-slate-500 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl font-medium bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Đang xử lý...' : isLogin ? 'Đăng nhập' : 'Đăng ký'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
