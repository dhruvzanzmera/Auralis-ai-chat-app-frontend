import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import AdminNavigation from './AdminNavigation'
import UserMenu from './UserMenu'

function PageHeader({ title, admin = false }) {
  const { user } = useAuth()
  const isAdmin = admin || user?.role === 'ADMIN'

  return (
    <header className="app-header flex min-h-14 items-center gap-3 px-4 py-2 sm:gap-4 sm:px-6">
      <Link to="/chat" className="flex shrink-0 items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2] text-sm font-bold text-white">A</span>
        <span className="hidden text-sm font-bold text-[#1a1a2e] sm:block">Auralis</span>
      </Link>
      <h1 className="min-w-0 flex-1 truncate text-sm font-semibold text-[#394055]">{title}</h1>
      <div className="flex shrink-0 items-center gap-2">
        <AdminNavigation admin={isAdmin} />
        <UserMenu />
      </div>
    </header>
  )
}

export default PageHeader
