import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)
const BASE = import.meta.env.VITE_API_URL

// Decode JWT payload without a library
function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

function isTokenExpired(token) {
  const payload = decodeToken(token)
  if (!payload?.exp) return true
  return payload.exp * 1000 < Date.now()
}

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('token')
      setLoading(false)
      return
    }
    // No /auth/me endpoint — decode user from the JWT payload directly
    const payload = decodeToken(token)
    setUser({ id: payload.id, username: payload.username })
    setLoading(false)
  }, [])

  // POST /api/auth/login  →  { token, username }
  const login = async (username, password) => {
    const { data } = await axios.post(`${BASE}/auth/login`, { username, password })
    localStorage.setItem('token', data.token)
    const payload = decodeToken(data.token)
    setUser({ id: payload.id, username: data.username })
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
