import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import LoadingIndicator from './LoadingIndicator'

function LoadingScreen() {
  return <main className="flex min-h-dvh items-center justify-center bg-[#f8f9fc]"><LoadingIndicator label="Verifying your secure session…" size="lg" /></main>
}

export function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}

export function RequireAdmin() {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/admin/login" replace />
  if (user.role !== 'ADMIN') return <Navigate to="/chat" replace />
  return <Outlet />
}

export function GuestOnly() {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <LoadingScreen />
  if (user && location.pathname !== '/admin/login') {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/chat'} replace />
  }
  if (user?.role === 'ADMIN' && location.pathname === '/admin/login') return <Navigate to="/admin" replace />
  return <Outlet />
}
