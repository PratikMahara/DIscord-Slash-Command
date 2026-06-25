import api from './api'

const mockReports = [
  { id: 'RPT-001', user: 'pratik#1234', message: 'Login page is broken on mobile', category: 'Bug',     priority: 'high',   createdAt: '2025-07-10 14:32', aiAnalysis: 'This appears to be a critical UI regression affecting mobile users. Recommend immediate investigation of responsive CSS breakpoints.' },
  { id: 'RPT-002', user: 'alex#5678',   message: 'Bot not responding in #general', category: 'Outage',  priority: 'high',   createdAt: '2025-07-10 13:10', aiAnalysis: 'Possible webhook timeout or rate limiting issue. Check Discord API logs for 429 responses.' },
  { id: 'RPT-003', user: 'sara#9012',   message: 'Status command shows wrong uptime', category: 'Bug',  priority: 'medium', createdAt: '2025-07-10 12:45', aiAnalysis: 'Uptime calculation may have an off-by-one error in the timestamp delta logic.' },
  { id: 'RPT-004', user: 'john#3456',   message: 'Add a /ping command please',      category: 'Feature',priority: 'low',    createdAt: '2025-07-10 11:20', aiAnalysis: 'Feature request for latency monitoring. Low complexity implementation, medium user value.' },
  { id: 'RPT-005', user: 'maya#7890',   message: 'Slash commands lag in large servers', category: 'Performance', priority: 'medium', createdAt: '2025-07-10 10:05', aiAnalysis: 'Interaction response time exceeding 3s threshold in guilds >10k members. Consider deferring replies.' },
  { id: 'RPT-006', user: 'leo#2345',    message: 'Report confirmation message missing', category: 'Bug', priority: 'low',   createdAt: '2025-07-09 18:30', aiAnalysis: 'Ephemeral reply may not be sent when report is created successfully. Check response handler.' },
]

const mockLogs = Array.from({ length: 40 }, (_, i) => ({
  id:        i + 1,
  user:      ['pratik#1234', 'alex#5678', 'sara#9012', 'john#3456', 'maya#7890'][i % 5],
  command:   ['/report', '/status', '/help', '/ping'][i % 4],
  result:    i % 7 === 0 ? 'failed' : 'success',
  timestamp: `2025-07-${String(10 - Math.floor(i / 8)).padStart(2, '0')} ${String(23 - (i % 24)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}`,
}))

export const getReports = async () => {
  try { return (await api.get('/reports')).data }
  catch { return mockReports }
}

export const getLogs = async (page = 1, limit = 10) => {
  try { return (await api.get(`/logs?page=${page}&limit=${limit}`)).data }
  catch {
    const start = (page - 1) * limit
    return { logs: mockLogs.slice(start, start + limit), total: mockLogs.length, page, limit }
  }
}

export const getSettings = async () => {
  try { return (await api.get('/settings')).data }
  catch {
    return {
      enableReportCommand:   true,
      enableStatusCommand:   true,
      enableAIAnalysis:      true,
      enableDiscordMirroring: false,
    }
  }
}

export const saveSettings = async (settings) => {
  try { return (await api.put('/settings', settings)).data }
  catch { return settings }
}
