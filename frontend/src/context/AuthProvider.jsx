import { useCallback, useEffect, useMemo, useState } from 'react'
import { authApi } from '../api/products'
import { AuthContext } from './authContext'

const TOKEN_KEY = 'campusbaazar-token'
const USER_KEY = 'campusbaazar-user'

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '')
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem(USER_KEY) || 'null'))

  const saveSession = useCallback((payload) => {
    const nextUser = { id: payload.userId, name: payload.name, email: payload.email, collegeEmail: payload.collegeEmail, institution: payload.institution, role: payload.role || 'STUDENT', phone: payload.phone, bio: payload.bio }
    if (payload.token) {
      localStorage.setItem(TOKEN_KEY, payload.token)
      setToken(payload.token)
    }
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    setUser(nextUser)
    return nextUser
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken('')
    setUser(null)
  }, [])

  useEffect(() => {
    window.addEventListener('campusbaazar-auth-expired', logout)
    return () => window.removeEventListener('campusbaazar-auth-expired', logout)
  }, [logout])

  useEffect(() => {
    if (!token) return
    authApi.me().then(saveSession).catch(logout)
  }, [logout, saveSession, token])

  const login = useCallback(async (credentials) => saveSession(await authApi.login(credentials)), [saveSession])
  const register = useCallback(async (profile) => saveSession(await authApi.register(profile)), [saveSession])
  const value = useMemo(() => ({ token, user, isAuthenticated: Boolean(token), login, register, logout }), [token, user, login, register, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
