import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  getMe,
  getStoredToken,
  guestLogin as apiGuestLogin,
  logout as apiLogout,
  requestOtp as apiRequestOtp,
  setStoredToken,
  verifyOtp as apiVerifyOtp,
} from '../lib/api'
import type { Role, User } from '../types'

interface AuthContextValue {
  user: User | null
  token: string | null
  loading: boolean
  isGuest: boolean
  requestOtp: (phone: string) => Promise<void>
  verifyOtp: (phone: string, otp: string, role?: Role) => Promise<User>
  guestLogin: (role: Role) => Promise<User>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => getStoredToken())
  const [loading, setLoading] = useState<boolean>(true)
  const [isGuest, setIsGuest] = useState<boolean>(false)

  useEffect(() => {
    let cancelled = false
    async function bootstrap() {
      const existing = getStoredToken()
      if (!existing) {
        setLoading(false)
        return
      }
      try {
        const { user: me } = await getMe()
        if (!cancelled) {
          setUser(me)
          setToken(existing)
        }
      } catch {
        setStoredToken(null)
        if (!cancelled) {
          setUser(null)
          setToken(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    bootstrap()
    return () => {
      cancelled = true
    }
  }, [])

  const requestOtp = useCallback(async (phone: string) => {
    await apiRequestOtp(phone)
  }, [])

  const verifyOtp = useCallback(async (phone: string, otp: string, role?: Role) => {
    const { token: t, user: u } = await apiVerifyOtp(phone, otp, role)
    setStoredToken(t)
    setToken(t)
    setUser(u)
    setIsGuest(false)
    return u
  }, [])

  const guestLogin = useCallback(async (role: Role) => {
    const { token: t, user: u } = await apiGuestLogin(role)
    setStoredToken(t)
    setToken(t)
    setUser(u)
    setIsGuest(true)
    return u
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } catch {
      // ignore — clear local state regardless, so a network error can't strand the user
      // logged-in-looking client-side while the button does nothing
    } finally {
      setStoredToken(null)
      setToken(null)
      setUser(null)
      setIsGuest(false)
    }
  }, [])

  const value = useMemo(
    () => ({ user, token, loading, isGuest, requestOtp, verifyOtp, guestLogin, logout }),
    [user, token, loading, isGuest, requestOtp, verifyOtp, guestLogin, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
