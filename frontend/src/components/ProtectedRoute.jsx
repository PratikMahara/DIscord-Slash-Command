import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <LoadingSpinner className="min-h-screen" size="lg" />
  return isAuthenticated ? children : <Navigate to="/login" replace />
}
