import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-900 text-center px-4">
      <div className="text-7xl font-black text-surface-700 mb-2">404</div>
      <h1 className="text-2xl font-bold text-slate-100 mb-2">Page not found</h1>
      <p className="text-slate-400 text-sm mb-6">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/dashboard" className="btn-primary">← Back to Dashboard</Link>
    </div>
  )
}
