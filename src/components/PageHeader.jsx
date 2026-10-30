import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { LogoutIcon, UserIcon } from './HeaderIcons'

function PageHeader({ title, admin = false }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')

  const signOut = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    setLogoutError('')
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (requestError) {
      setLogoutError(requestError.response?.data?.message || 'Could not sign out. Please try again.')
    } finally {
      setLoggingOut(false)
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
      {logoutError && <span role="alert" className="absolute right-4 top-full z-20 mt-1 max-w-[min(20rem,calc(100vw-2rem))] rounded-lg border border-red-200 bg-white px-3 py-2 text-xs text-red-700 shadow-md">{logoutError}</span>}
      <button onClick={signOut} disabled={loggingOut} aria-busy={loggingOut} aria-label={loggingOut ? 'Signing out' : 'Sign out'} title={logoutError || (loggingOut ? 'Signing out…' : 'Sign out')} className="flex h-10 w-10 items-center justify-center rounded-lg p-2 text-[#7986a8] transition hover:bg-[#fce8e8] hover:text-[#c62828] disabled:cursor-wait disabled:opacity-60">
        {loggingOut
          ? <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          : <LogoutIcon />
        }
      </button>
    </header>
  )
}

export default PageHeader
