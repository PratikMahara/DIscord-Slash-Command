import { useEffect, useState } from 'react'
import axios from 'axios'
import PageHeader from '../components/PageHeader'
import DataTable  from '../components/DataTable'
import { useToast } from '../context/ToastContext'

const BASE  = import.meta.env.VITE_API_URL
const LIMIT = 10

// Backend row: { id, guild_id, channel_id, user_id, username, command, options, response, mirrored, status, created_at }
const columns = [
  { key: 'username',   label: 'User' },
  { key: 'command',    label: 'Command',   render: (v) => <code className="bg-surface-700 px-2 py-0.5 rounded text-brand-400 text-xs">/{v}</code> },
  { key: 'status',     label: 'Status',    render: (v) => <span className={`badge ${v === 'processed' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>{v}</span> },
  { key: 'mirrored',   label: 'Mirrored',  render: (v) => <span className={`badge ${v ? 'bg-brand-600/15 text-brand-400' : 'bg-surface-600 text-slate-400'}`}>{v ? 'Yes' : 'No'}</span> },
  { key: 'created_at', label: 'Timestamp', render: (v) => <span className="text-xs text-slate-500">{new Date(v).toLocaleString()}</span> },
]

export default function Logs() {
  const toast = useToast()
  const [logs,    setLogs]    = useState([])
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(1)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  const load = (p) => {
    setLoading(true)
    setError(false)
    axios
      .get(`${BASE}/dashboard/logs`, {
        params:  { page: p, limit: LIMIT },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then(({ data }) => {
        setLogs(data.logs)
        setTotal(data.total)
      })
      .catch((err) => {
        setError(true)
        toast(err.response?.data?.error || 'Failed to load logs', 'error')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(page) }, [page])

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div>
      <PageHeader title="Command Logs" subtitle={loading ? 'Loading…' : `${total} total log entries`} />

      <div className="card">
        {error ? (
          <div className="flex flex-col items-center py-16 gap-2">
            <p className="text-sm text-red-400">Failed to load logs.</p>
            <button onClick={() => load(page)} className="text-xs text-brand-400 hover:underline">Retry</button>
          </div>
        ) : (
          <DataTable columns={columns} data={logs} loading={loading} />
        )}

        {!error && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-600">
            <p className="text-xs text-slate-500">
              Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1 || loading}
                className="px-3 py-1.5 text-xs rounded-lg border border-surface-500 text-slate-400 hover:bg-surface-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const n = i + 1
                return (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    disabled={loading}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-colors disabled:opacity-40 ${page === n ? 'bg-brand-600 border-brand-600 text-white' : 'border-surface-500 text-slate-400 hover:bg-surface-700'}`}
                  >
                    {n}
                  </button>
                )
              })}
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages || loading}
                className="px-3 py-1.5 text-xs rounded-lg border border-surface-500 text-slate-400 hover:bg-surface-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
