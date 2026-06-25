import { useState } from 'react'
import PageHeader    from '../components/PageHeader'
import ToggleSwitch  from '../components/ToggleSwitch'
import { useToast }  from '../context/ToastContext'

const SETTING_DEFS = [
  { key: 'enableReportCommand',    label: 'Enable Report Command',    desc: 'Allow users to submit reports via /report' },
  { key: 'enableStatusCommand',    label: 'Enable Status Command',    desc: 'Allow users to check bot status via /status' },
  { key: 'enableAIAnalysis',       label: 'Enable AI Analysis',       desc: 'Automatically analyse reports using AI' },
  { key: 'enableDiscordMirroring', label: 'Enable Discord Mirroring', desc: 'Mirror bot interactions to a secondary channel' },
]

const DEFAULTS = {
  enableReportCommand:    true,
  enableStatusCommand:    true,
  enableAIAnalysis:       false,
  enableDiscordMirroring: true,
}

export default function Settings() {
  const toast = useToast()
  const [settings, setSettings] = useState(DEFAULTS)
  const [saving,   setSaving]   = useState(false)

  const toggle = (key) => setSettings((s) => ({ ...s, [key]: !s[key] }))

  const handleSave = async () => {
    setSaving(true)
    // Simulate save — backend /api/settings endpoint not yet implemented
    await new Promise((r) => setTimeout(r, 600))
    setSaving(false)
    toast('Settings saved (local only — backend endpoint pending)', 'info')
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Configure bot behaviour and integrations" />

      <div className="max-w-2xl space-y-3">
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-xs text-amber-400 mb-2">
          ⚠ The settings API endpoint is not yet implemented on the backend. Changes are saved locally only.
        </div>

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
