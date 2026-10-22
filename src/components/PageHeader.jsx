import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { LogoutIcon, UserIcon } from './HeaderIcons'

function PageHeader({ title, admin = false }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const signOut = async () => {
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch {
      // Keep the user on the page when the server has not confirmed logout.
    }
  }

  return (
    <header className="app-header flex min-h-14 items-center gap-3 px-4 py-2">
      <Link to="/chat" className="flex shrink-0 items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2] text-sm font-bold text-white">A</span>
        <span className="hidden text-sm font-bold text-[#1a1a2e] sm:block">Auralis</span>
      </Link>
      <h1 className="min-w-0 flex-1 truncate text-sm font-semibold text-[#394055]">{title}</h1>
      {admin && <Link to="/admin" className="rounded-lg px-2.5 py-2 text-xs font-medium text-[#5c6bc0] transition hover:bg-[#eef0fb]">Dashboard</Link>}
      {admin && <Link to="/admin/users" className="rounded-lg px-2.5 py-2 text-xs font-medium text-[#5c6bc0] transition hover:bg-[#eef0fb]">Users</Link>}
      {!admin && user?.role === 'ADMIN' && <Link to="/admin" className="rounded-lg px-2.5 py-2 text-xs font-medium text-[#5c6bc0] transition hover:bg-[#eef0fb]">Admin</Link>}
      <Link to="/account" aria-label="Account" title="Account" className="rounded-lg p-2 text-[#5c6bc0] transition hover:bg-[#eef0fb]">
        <UserIcon />
      </Link>
      <button onClick={signOut} aria-label="Sign out" title="Sign out" className="rounded-lg p-2 text-[#7986a8] transition hover:bg-[#fce8e8] hover:text-[#c62828]">
        <LogoutIcon />
      </button>
    </header>
  )
}

export default PageHeader
