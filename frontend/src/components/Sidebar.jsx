import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/dashboard', label: 'Dashboard',     icon: '⊞' },
  { to: '/reports',   label: 'Reports',        icon: '⚑' },
  { to: '/logs',      label: 'Command Logs',   icon: '≡' },
  { to: '/settings',  label: 'Settings',       icon: '⚙' },
]

export default function Sidebar({ open, onClose }) {
  const { logout } = useAuth()
  const navigate   = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={onClose} />}

      <aside className={`fixed top-0 left-0 h-full w-60 bg-surface-800 border-r border-surface-600 flex flex-col z-30 transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-surface-600">
          <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm">D</div>
          <div>
            <p className="font-semibold text-slate-100 text-sm leading-tight">BotDash</p>
            <p className="text-xs text-slate-500">Admin Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-600/20 text-brand-400 border border-brand-600/30'
                    : 'text-slate-400 hover:bg-surface-700 hover:text-slate-100'
                }`
              }
            >
              <span className="text-base w-5 text-center">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-surface-600">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full"
          >
            <span className="text-base w-5 text-center">⏻</span>
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
