import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function ProtectedRoute() {
  const { usuario } = useAuth()
  const local = useLocation()

  if (!usuario) {
    return <Navigate to="/login" replace state={{ de: local.pathname }} />
  }
  return <Outlet />
}
