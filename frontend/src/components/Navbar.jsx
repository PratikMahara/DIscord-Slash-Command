import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const TITLES = {
  '/dashboard': 'Dashboard',
  '/reports':   'Reports',
  '/logs':      'Command Logs',
  '/settings':  'Settings',
}

export default function Navbar({ onMenuClick }) {
  const { pathname } = useLocation()
  const { user }     = useAuth()
  const title        = TITLES[pathname] ?? 'Dashboard'
  const initials     = user?.username?.[0]?.toUpperCase() ?? 'A'

  return (
    <header className="h-14 bg-surface-800 border-b border-surface-600 flex items-center justify-between px-4 lg:px-6 shrink-0">
      <div className="flex items-center gap-3">
        {/* Hamburger – mobile only */}
        <button onClick={onMenuClick} className="lg:hidden text-slate-400 hover:text-slate-100 p-1">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h2 className="font-semibold text-slate-100">{title}</h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button className="relative p-2 text-slate-400 hover:text-slate-100 transition-colors">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-brand-500 rounded-full" />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white">
            {initials}
          </div>
          <span className="hidden sm:block text-sm text-slate-300">{user?.username ?? 'Admin'}</span>
        </div>
      </div>
    </header>
  )
}
