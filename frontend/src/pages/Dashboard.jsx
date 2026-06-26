import { useEffect, useState } from 'react'
import axios from 'axios'
import StatCard   from '../components/StatCard'
import DataTable  from '../components/DataTable'
import PageHeader from '../components/PageHeader'
import { useToast } from '../context/ToastContext'

const BASE = import.meta.env.VITE_API_URL

const priorityColor = (v) => {
  if (!v) return undefined
  if (v === 'high')   return '#ff4444'
  if (v === 'medium') return '#ffaa00'
  if (v === 'low')    return '#44ff88'
  return undefined
}

// GET /api/dashboard/logs  →  row fields include ai_summary, ai_tag, ai_priority
const activityColumns = [
  { key: 'username',   label: 'User' },
  { key: 'command',    label: 'Command',   render: (v) => <code className="bg-surface-700 px-2 py-0.5 rounded text-brand-400 text-xs">/{v}</code> },
  { key: 'ai_summary', label: 'AI Summary', render: (v) => <span className="text-xs text-slate-400">{v ?? '—'}</span> },
  { key: 'ai_tag',     label: 'Tag',        render: (v) => <span className="text-xs text-slate-300">{v ?? '—'}</span> },
  { key: 'ai_priority', label: 'Priority',  render: (v) => v
      ? <span className="text-xs font-semibold capitalize" style={{ color: priorityColor(v) }}>{v}</span>
      : <span className="text-xs text-slate-500">—</span>
  },
  { key: 'status',     label: 'Status',    render: (v) => <span className={`badge ${v === 'processed' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>{v}</span> },
  { key: 'created_at', label: 'Timestamp', render: (v) => <span className="text-slate-500 text-xs">{new Date(v).toLocaleString()}</span> },
]

export default function Dashboard() {
  const toast = useToast()
  const [stats,    setStats]    = useState(null)
  const [activity, setActivity] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [errors,   setErrors]   = useState({ stats: false, activity: false })

  const authHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  })

  const load = () => {
    setLoading(true)
    setErrors({ stats: false, activity: false })

    const req = (promise, onSuccess, key, label) =>
      promise
        .then(({ data }) => onSuccess(data))
        .catch((err) => {
          setErrors((e) => ({ ...e, [key]: true }))
          toast(err.response?.data?.error || `Failed to load ${label}`, 'error')
        })

    Promise.allSettled([
      req(axios.get(`${BASE}/dashboard/stats`, authHeader()), setStats,    'stats',    'stats'),
      req(axios.get(`${BASE}/dashboard/logs`,  authHeader()), (d) => setActivity(d.logs ?? []), 'activity', 'activity'),
    ]).finally(() => setLoading(false))
  }

  useEffect(load, [])

  // Map backend shape  { total, mirrored, byCommand }  to stat cards
  const statCards = stats ? [
    { title: 'Total Commands',   value: stats.total,                                             icon: '⌘', color: 'brand'  },
    { title: 'Mirrored',         value: stats.mirrored,                                          icon: '⚑', color: 'yellow' },
    { title: 'Top Command',      value: stats.byCommand?.[0]?.command ?? '—',                    icon: '✓', color: 'green'  },
    { title: 'Unique Commands',  value: stats.byCommand?.length ?? 0,                            icon: '≡', color: 'brand'  },
  ] : []

  const RetryLink = () => (
    <button onClick={load} className="text-xs text-brand-400 hover:underline mt-1">Retry</button>
  )

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of bot activity and system health" />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {loading
          ? Array(4).fill(0).map((_, i) => <div key={i} className="card p-5 h-28 animate-pulse bg-surface-700" />)
          : errors.stats
            ? <div className="sm:col-span-2 xl:col-span-4 card p-5 flex flex-col items-center py-10">
                <p className="text-sm text-red-400">Failed to load stats.</p><RetryLink />
              </div>
            : statCards.map((c) => <StatCard key={c.title} {...c} />)
        }
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <div className="xl:col-span-2 card p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Recent Commands</h3>
          {errors.activity
            ? <div className="flex flex-col items-center py-10"><p className="text-sm text-red-400">Failed to load activity.</p><RetryLink /></div>
            : <DataTable columns={activityColumns} data={activity} loading={loading} />
          }
        </div>

        {/* Command Breakdown */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Command Breakdown</h3>
          {loading ? (
            <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="h-10 rounded-lg bg-surface-700 animate-pulse" />)}</div>
          ) : errors.stats ? (
            <div className="flex flex-col items-center py-10"><p className="text-sm text-red-400">Failed to load.</p><RetryLink /></div>
          ) : stats?.byCommand?.length ? (
            <div className="space-y-2">
              {stats.byCommand.map(({ command, count }) => (
                <div key={command} className="flex items-center justify-between bg-surface-700 rounded-lg px-4 py-3">
                  <code className="text-sm text-brand-400">/{command}</code>
                  <span className="text-sm font-semibold text-slate-200">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-10">No commands yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
