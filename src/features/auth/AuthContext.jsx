import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../../shared/lib/supabase'

// 1. Khởi tạo Context
const AuthContext = createContext({
    user: null,
    session: null,
    isLoading: true,
    signOut: async () => { },
})

// 2. Custom hook để gọi dữ liệu ra dễ dàng từ bất kỳ đâu
export const useAuth = () => {
    return useContext(AuthContext)
}

// 3. Provider bọc xung quanh ứng dụng
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [session, setSession] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // A. Lấy session hiện tại lúc mới vào app
        const getInitialSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession()
                if (error) {
                    console.error('Lỗi khi lấy session Supabase:', error.message)
                } else {
                    setSession(session)
                    setUser(session?.user ?? null)
                }
            } catch (e) {
                console.error('Lỗi khởi tạo Auth (kiểm tra .env hoặc Supabase):', e)
            } finally {
                setIsLoading(false)
            }
        }

        getInitialSession()

        // B. Lắng nghe mọi thay đổi (Đăng nhập, Đăng xuất, Đổi mật khẩu...)
        let subscription
        try {
            const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(
                (_event, currentSession) => {
                    setSession(currentSession)
                    setUser(currentSession?.user ?? null)
                    setIsLoading(false)
                }
            )
            subscription = sub
        } catch (e) {
            console.error('Lỗi onAuthStateChange:', e)
            setIsLoading(false)
        }

        // Cleanup khi component unmount
        return () => {
            subscription?.unsubscribe?.()
        }
    }, [])

    // Hàm Log out dùng chung
    const signOut = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) console.error('Lỗi đăng xuất:', error.message)
    }

    // Value truyền xuống cho các components con (bên trong children)
    const value = {
        session,
        user,
        isLoading,
        signOut,
    }

    return (
        <AuthContext.Provider value={value}>
            {/* Trong lúc đang check session thì có thể hiện màn hình loading mờ nếu muốn */}
            {!isLoading && children}
        </AuthContext.Provider>
    )
}
