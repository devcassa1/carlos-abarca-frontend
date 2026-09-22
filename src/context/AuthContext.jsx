import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api, { getToken, setToken } from '@/api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function restoreSession() {
      if (!getToken()) {
        setLoading(false)
        return
      }
      try {
        const response = await api.get('/me')
        if (active) {
          setUser(response.data.user ?? response.data)
        }
      } catch {
        setToken(null)
        if (active) {
          setUser(null)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    restoreSession()

    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (user, password) => {
    const response = await api.post('/login', { user, password })
    const { access_token, user: sessionUser } = response.data
    setToken(access_token)
    setUser(sessionUser)
    return sessionUser
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/logout')
    } catch {
      // token invalidation is best-effort; local session must be cleared anyway
    }
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, logout, isAuthenticated: Boolean(user) }),
    [user, loading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}

export default AuthContext