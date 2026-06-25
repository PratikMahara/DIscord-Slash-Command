import { useEffect, useState } from 'react'
import axios from 'axios'
import PageHeader     from '../components/PageHeader'
import ToggleSwitch   from '../components/ToggleSwitch'
import LoadingSpinner from '../components/LoadingSpinner'
import { useToast }   from '../context/ToastContext'

const BASE = import.meta.env.VITE_API_URL

const SETTING_DEFS = [
  { key: 'enableReportCommand',    label: 'Enable Report Command',    desc: 'Allow users to submit reports via /report' },
  { key: 'enableStatusCommand',    label: 'Enable Status Command',    desc: 'Allow users to check bot status via /status' },
  { key: 'enableAIAnalysis',       label: 'Enable AI Analysis',       desc: 'Automatically analyse reports using AI' },
  { key: 'enableDiscordMirroring', label: 'Enable Discord Mirroring', desc: 'Mirror bot interactions to a secondary channel' },
]

export default function Settings() {
  const toast = useToast()
  const [settings, setSettings] = useState(null)
  const [saving,   setSaving]   = useState(false)
  const [loadErr,  setLoadErr]  = useState(false)

  const authHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  })

  const load = () => {
    setLoadErr(false)
    axios
      .get(`${BASE}/settings`, authHeader())
      .then(({ data }) => setSettings(data))
      .catch((err) => {
        setLoadErr(true)
        toast(err.response?.data?.message || 'Failed to load settings', 'error')
      })
  }

  useEffect(load, [])

  const toggle = (key) => setSettings((s) => ({ ...s, [key]: !s[key] }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data } = await axios.put(`${BASE}/settings`, settings, authHeader())
      setSettings(data)
      toast('Settings saved successfully', 'success')
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to save settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loadErr) return (
    <div>
      <PageHeader title="Settings" subtitle="Configure bot behaviour and integrations" />
      <div className="flex flex-col items-center py-20 gap-2">
        <p className="text-sm text-red-400">Failed to load settings.</p>
        <button onClick={load} className="text-xs text-brand-400 hover:underline">Retry</button>
      </div>
    </div>
  )

  if (!settings) return <LoadingSpinner className="py-20" size="lg" />

  return (
    <div>
      <PageHeader title="Settings" subtitle="Configure bot behaviour and integrations" />

      <div className="max-w-2xl space-y-3">
        {SETTING_DEFS.map(({ key, label, desc }) => (
          <div key={key} className="card px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-200">{label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            </div>
            <ToggleSwitch checked={!!settings[key]} onChange={() => toggle(key)} disabled={saving} />
          </div>
        ))}

        <div className="pt-2">
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            {saving
              ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Saving…</>
              : 'Save Changes'
            }
          </button>
        </div>
      </div>
    </div>
  )
}
