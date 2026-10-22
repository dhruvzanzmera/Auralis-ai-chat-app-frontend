import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import { GuestOnly, RequireAdmin, RequireAuth } from './components/RouteGuards'
import AccountPage from './pages/AccountPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminUsersPage from './pages/AdminUsersPage'
import ChatPage from './pages/ChatPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ResetPasswordPage from './pages/ResetPasswordPage'

function HomeRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <main className="flex min-h-dvh items-center justify-center bg-[#f8f9fc] text-sm text-[#7986a8]">Loading your secure workspace…</main>
  return <Navigate to={user ? (user.role === 'ADMIN' ? '/admin' : '/chat') : '/login'} replace />
}

function App() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/account" element={<AccountPage />} />
      </Route>

      <Route element={<RequireAdmin />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
      </Route>

      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  )
}

export default App
