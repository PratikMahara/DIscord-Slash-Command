export default function StatCard({ title, value, icon, trend, color = 'brand' }) {
  const colors = {
    brand:  'from-brand-600/20 to-brand-600/5 border-brand-600/30 text-brand-400',
    green:  'from-emerald-600/20 to-emerald-600/5 border-emerald-600/30 text-emerald-400',
    yellow: 'from-amber-600/20 to-amber-600/5 border-amber-600/30 text-amber-400',
    red:    'from-red-600/20 to-red-600/5 border-red-600/30 text-red-400',
  }
  return (
    <div className={`card p-5 bg-gradient-to-br ${colors[color]} relative overflow-hidden`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-100">{value}</p>
          {trend && <p className="mt-1 text-xs text-slate-400">{trend}</p>}
        </div>
        <div className="text-2xl opacity-80">{icon}</div>
      </div>
    </div>
  )
}
