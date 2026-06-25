import api from './api'

const mockStats = {
  totalCommands: 1284,
  reportsToday: 23,
  activeCommands: 6,
  failedInteractions: 4,
}

const mockActivity = [
  { id: 1, user: 'pratik#1234',  command: '/report', status: 'success', timestamp: '2025-07-10 14:32' },
  { id: 2, user: 'alex#5678',    command: '/status', status: 'success', timestamp: '2025-07-10 14:28' },
  { id: 3, user: 'sara#9012',    command: '/report', status: 'failed',  timestamp: '2025-07-10 14:20' },
  { id: 4, user: 'john#3456',    command: '/help',   status: 'success', timestamp: '2025-07-10 14:15' },
  { id: 5, user: 'maya#7890',    command: '/report', status: 'success', timestamp: '2025-07-10 14:05' },
]

const mockSystemStatus = {
  bot:      'online',
  database: 'connected',
  webhook:  'connected',
}

export const getStats = async () => {
  try { return (await api.get('/dashboard/stats')).data }
  catch { return mockStats }
}

export const getRecentActivity = async () => {
  try { return (await api.get('/dashboard/activity')).data }
  catch { return mockActivity }
}

export const getSystemStatus = async () => {
  try { return (await api.get('/dashboard/status')).data }
  catch { return mockSystemStatus }
}
