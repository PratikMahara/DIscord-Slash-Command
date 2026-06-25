import { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import PageHeader  from '../components/PageHeader'
import DataTable   from '../components/DataTable'
import SearchInput from '../components/SearchInput'
import Modal       from '../components/Modal'
import EmptyState  from '../components/EmptyState'
import { useToast } from '../context/ToastContext'

const BASE = import.meta.env.VITE_API_URL

// Reuse /dashboard/logs filtered to command === 'report'
// Row shape: { id, username, command, options, response, status, mirrored, created_at }
const columns = [
  { key: 'id',         label: 'ID',         render: (v) => <span className="font-mono text-xs text-slate-400">{String(v).slice(-6)}</span> },
  { key: 'username',   label: 'User' },
  { key: 'options',    label: 'Message',    render: (v) => {
      try {
        const opts = typeof v === 'string' ? JSON.parse(v) : v
        return <span className="max-w-xs truncate block">{opts?.[0]?.value ?? '—'}</span>
      } catch { return <span className="text-slate-500">—</span> }
    }
  },
  { key: 'status',     label: 'Status',     render: (v) => <span className={`badge ${v === 'processed' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>{v}</span> },
  { key: 'mirrored',   label: 'Mirrored',   render: (v) => <span className={`badge ${v ? 'bg-brand-600/15 text-brand-400' : 'bg-surface-600 text-slate-400'}`}>{v ? 'Yes' : 'No'}</span> },
  { key: 'created_at', label: 'Created At', render: (v) => <span className="text-xs text-slate-500">{new Date(v).toLocaleString()}</span> },
]

export default function Reports() {
  const toast = useToast()
  const [reports,  setReports]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(false)
  const [search,   setSearch]   = useState('')
  const [selected, setSelected] = useState(null)

  const load = () => {
    setLoading(true)
    setError(false)
    // Fetch all logs and filter to /report commands on the frontend
    axios
      .get(`${BASE}/dashboard/logs`, {
        params:  { page: 1, limit: 100 },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then(({ data }) => {
        const reportRows = (data.logs ?? []).filter((r) => r.command === 'report')
        setReports(reportRows)
      })
      .catch((err) => {
        setError(true)
        toast(err.response?.data?.error || 'Failed to load reports', 'error')
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const filtered = useMemo(() => reports.filter((r) => {
    const search_ = search.toLowerCase()
    return r.username?.toLowerCase().includes(search_) ||
           r.options?.toLowerCase().includes(search_)
  }), [reports, search])

  // Parse message text from options JSON for the modal
  const getMessage = (row) => {
    try {
      const opts = typeof row.options === 'string' ? JSON.parse(row.options) : row.options
      return opts?.[0]?.value ?? '—'
    } catch { return '—' }
  }

  return (
    <div>
      <PageHeader title="Reports" subtitle={loading ? 'Loading…' : `${reports.length} total reports`} />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by user or message…" />
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
              <EmptyState message="No reports match your search." />
            )}
          </>
        )}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Report — ${selected?.id}`}>
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['User',      selected.username],
                ['Status',    selected.status],
                ['Mirrored',  selected.mirrored ? 'Yes' : 'No'],
                ['Created',   new Date(selected.created_at).toLocaleString()],
              ].map(([k, v]) => (
                <div key={k} className="bg-surface-700 rounded-lg px-3 py-2">
                  <p className="text-xs text-slate-500 mb-0.5">{k}</p>
                  <p className="text-slate-200 font-medium">{v}</p>
                </div>
              ))}
            </div>
            <div className="bg-surface-700 rounded-lg px-3 py-2">
              <p className="text-xs text-slate-500 mb-1">Message</p>
              <p className="text-slate-200">{getMessage(selected)}</p>
            </div>
            <div className="bg-surface-700 rounded-lg px-3 py-2">
              <p className="text-xs text-slate-500 mb-1">Bot Response</p>
              <p className="text-slate-200">{selected.response}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
