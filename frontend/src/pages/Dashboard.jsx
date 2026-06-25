import { useEffect, useState } from 'react'
import axios from 'axios'
import StatCard   from '../components/StatCard'
import DataTable  from '../components/DataTable'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import { useToast } from '../context/ToastContext'

const BASE = import.meta.env.VITE_API_URL

const STATUS_DOT = {
  online: 'bg-emerald-400', connected: 'bg-emerald-400',
  offline: 'bg-red-400',   disconnected: 'bg-red-400',
}

const activityColumns = [
  { key: 'user',      label: 'User' },
  { key: 'command',   label: 'Command',   render: (v) => <code className="bg-surface-700 px-2 py-0.5 rounded text-brand-400 text-xs">{v}</code> },
  { key: 'status',    label: 'Status',    render: (v) => <span className={`badge ${v === 'success' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>{v}</span> },
  { key: 'timestamp', label: 'Timestamp', render: (v) => <span className="text-slate-500 text-xs">{v}</span> },
]

export default function Dashboard() {
  const toast = useToast()
  const [stats,     setStats]     = useState(null)
  const [activity,  setActivity]  = useState([])
  const [sysStatus, setSysStatus] = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [errors,    setErrors]    = useState({ stats: false, activity: false, status: false })

  const authHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  })

  const load = () => {
    setLoading(true)
    setErrors({ stats: false, activity: false, status: false })

    const req = (promise, onSuccess, key, label) =>
      promise
        .then(({ data }) => onSuccess(data))
        .catch((err) => {
          setErrors((e) => ({ ...e, [key]: true }))
          toast(err.response?.data?.message || `Failed to load ${label}`, 'error')
        })

    Promise.allSettled([
      req(axios.get(`${BASE}/dashboard/stats`,    authHeader()), setStats,     'stats',    'stats'),
      req(axios.get(`${BASE}/dashboard/activity`, authHeader()), setActivity,  'activity', 'activity'),
      req(axios.get(`${BASE}/dashboard/status`,   authHeader()), setSysStatus, 'status',   'system status'),
    ]).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const statCards = stats ? [
    { title: 'Total Commands',      value: stats.totalCommands,      icon: '⌘', color: 'brand'  },
    { title: 'Reports Today',       value: stats.reportsToday,       icon: '⚑', color: 'yellow' },
    { title: 'Active Commands',     value: stats.activeCommands,     icon: '✓', color: 'green'  },
    { title: 'Failed Interactions', value: stats.failedInteractions, icon: '✗', color: 'red'    },
  ] : []

  const RetryLink = () => (
    <button onClick={load} className="text-xs text-brand-400 hover:underline mt-1">Retry</button>
  )

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of bot activity and system health" />

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
        <div className="xl:col-span-2 card p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Recent Commands</h3>
          {errors.activity
            ? <div className="flex flex-col items-center py-10"><p className="text-sm text-red-400">Failed to load activity.</p><RetryLink /></div>
            : <DataTable columns={activityColumns} data={activity} loading={loading} />
          }
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">System Status</h3>
          {loading ? (
            <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="h-10 rounded-lg bg-surface-700 animate-pulse" />)}</div>
          ) : errors.status ? (
            <div className="flex flex-col items-center py-10"><p className="text-sm text-red-400">Failed to load status.</p><RetryLink /></div>
          ) : sysStatus ? (
            <div className="space-y-3">
              {[
                { label: 'Bot Status', value: sysStatus.bot },
                { label: 'Database',   value: sysStatus.database },
                { label: 'Webhook',    value: sysStatus.webhook },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between bg-surface-700 rounded-lg px-4 py-3">
                  <span className="text-sm text-slate-400">{label}</span>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full animate-pulse ${STATUS_DOT[value] ?? 'bg-slate-500'}`} />
                    <span className="text-sm font-medium text-slate-200 capitalize">{value}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : <EmptyState message="No status data" />}
        </div>
      </div>
    </div>
  )
}
