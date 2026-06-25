import api from './api'

const MOCK_USER = { id: 1, name: 'Admin', email: 'admin@discord.bot', role: 'admin' }
const MOCK_TOKEN = 'mock.jwt.token'

export const login = async (email, password) => {
  try {
    const { data } = await api.post('/auth/login', { email, password })
    return data
  } catch {
    // Mock fallback
    if (email === 'admin@discord.bot' && password === 'admin123') {
      return { token: MOCK_TOKEN, user: MOCK_USER }
    }
    throw new Error('Invalid credentials')
  }
}

export const getMe = async () => {
  try {
    const { data } = await api.get('/auth/me')
    return data
  } catch {
    return MOCK_USER
  }
}
