import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute   from '../components/ProtectedRoute'
import DashboardLayout  from '../layouts/DashboardLayout'
import Login     from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import Reports   from '../pages/Reports'
import Logs      from '../pages/Logs'
import Settings  from '../pages/Settings'
import NotFound  from '../pages/NotFound'

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reports"   element={<Reports />} />
          <Route path="/logs"      element={<Logs />} />
          <Route path="/settings"  element={<Settings />} />
        </Route>

        <Route path="/not-found" element={<NotFound />} />
        <Route path="*"          element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
