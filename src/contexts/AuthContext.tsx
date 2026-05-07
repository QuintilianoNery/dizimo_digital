import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { SessionUser } from '../types'
import { api } from '../services/api'

interface AuthContextValue {
  user: SessionUser | null
  loading: boolean
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)

  async function refresh() {
    try {
      const data = await api.auth.session() as SessionUser
      setUser(data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    await api.auth.logout()
    setUser(null)
    localStorage.removeItem('dizimo_remember')
  }

  useEffect(() => { refresh() }, [])

  return (
    <AuthContext.Provider value={{ user, loading, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
