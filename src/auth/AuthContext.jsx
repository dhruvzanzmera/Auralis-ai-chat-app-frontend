import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { chatApi } from '../api/chatApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    chatApi.get('/auth/me')
      .then(({ data }) => {
        if (active) setUser(data.user || data)
      })
      .catch(() => {
        if (active) setUser(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const signIn = useCallback(async (credentials) => {
    const { data } = await chatApi.post('/auth/login', credentials)
    const authenticatedUser = data.user || data
    setUser(authenticatedUser)
    return authenticatedUser
  }, [])

  const register = useCallback(async (details) => {
    const { data } = await chatApi.post('/auth/register', details)
    const authenticatedUser = data.user || data
    setUser(authenticatedUser)
    return authenticatedUser
  }, [])

  const logout = useCallback(async () => {
    await chatApi.post('/auth/logout')
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, loading, signIn, register, logout }), [user, loading, signIn, register, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider.')
  return context
}
