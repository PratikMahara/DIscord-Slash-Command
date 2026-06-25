import { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import PageHeader  from '../components/PageHeader'
import DataTable   from '../components/DataTable'
import SearchInput from '../components/SearchInput'
import Modal       from '../components/Modal'
import EmptyState  from '../components/EmptyState'
import { useToast } from '../context/ToastContext'

const BASE = import.meta.env.VITE_API_URL

const PRIORITY_BADGE = {
  high:   'bg-red-500/15 text-red-400 border border-red-500/30',
  medium: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  low:    'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
}

const columns = [
  { key: 'id',        label: 'Report ID',  render: (v) => <span className="font-mono text-xs text-slate-400">{v}</span> },
  { key: 'user',      label: 'User' },
  { key: 'message',   label: 'Message',    render: (v) => <span className="max-w-xs truncate block">{v}</span> },
  { key: 'category',  label: 'Category',   render: (v) => <span className="badge bg-surface-600 text-slate-300">{v}</span> },
  { key: 'priority',  label: 'Priority',   render: (v) => <span className={`badge ${PRIORITY_BADGE[v] ?? ''}`}>{v}</span> },
  { key: 'createdAt', label: 'Created At', render: (v) => <span className="text-xs text-slate-500">{v}</span> },
]

export default function Reports() {
  const toast = useToast()
  const [reports,  setReports]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(false)
  const [search,   setSearch]   = useState('')
  const [priority, setPriority] = useState('all')
  const [selected, setSelected] = useState(null)

  const load = () => {
    setLoading(true)
    setError(false)
    axios
      .get(`${BASE}/reports`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then(({ data }) => setReports(data))
      .catch((err) => {
        setError(true)
        toast(err.response?.data?.message || 'Failed to load reports', 'error')
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const filtered = useMemo(() => reports.filter((r) => {
    const matchSearch   = r.message.toLowerCase().includes(search.toLowerCase()) ||
                          r.user.toLowerCase().includes(search.toLowerCase())
    const matchPriority = priority === 'all' || r.priority === priority
    return matchSearch && matchPriority
  }), [reports, search, priority])

  return (
    <div>
      <PageHeader title="Reports" subtitle={loading ? 'Loading…' : `${reports.length} total reports`} />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Search reports…" /></div>
        <div className="flex gap-1 bg-surface-800 border border-surface-600 rounded-lg p-1">
          {['all', 'high', 'medium', 'low'].map((p) => (
            <button
              key={p}
              onClick={() => setPriority(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${priority === p ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-100'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        {error ? (
          <div className="flex flex-col items-center py-16 gap-2">
            <p className="text-sm text-red-400">Failed to load reports.</p>
            <button onClick={load} className="text-xs text-brand-400 hover:underline">Retry</button>
          </div>
        ) : (
          <>
            <DataTable columns={columns} data={filtered} loading={loading} onRowClick={setSelected} />
            {!loading && reports.length > 0 && filtered.length === 0 && (
              <EmptyState message="No reports match your search or filter." />
            )}
          </>
        )}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Report ${selected?.id}`}>
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['User',     selected.user],
                ['Category', selected.category],
                ['Priority', selected.priority],
                ['Created',  selected.createdAt],
              ].map(([k, v]) => (
                <div key={k} className="bg-surface-700 rounded-lg px-3 py-2">
                  <p className="text-xs text-slate-500 mb-0.5">{k}</p>
                  <p className="text-slate-200 capitalize font-medium">{v}</p>
                </div>
              ))}
            </div>
            <div className="bg-surface-700 rounded-lg px-3 py-2">
              <p className="text-xs text-slate-500 mb-1">Message</p>
              <p className="text-slate-200">{selected.message}</p>
            </div>
            {selected.aiAnalysis && (
              <div className="bg-brand-600/10 border border-brand-600/25 rounded-lg px-3 py-3">
                <p className="text-brand-400 text-xs font-semibold uppercase tracking-wider mb-2">✦ AI Analysis</p>
                <p className="text-slate-300 text-sm leading-relaxed">{selected.aiAnalysis}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
