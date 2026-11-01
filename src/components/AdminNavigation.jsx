import { NavLink } from 'react-router-dom'
import { ChatIcon } from './HeaderIcons'

function AdminNavigation({ admin = false }) {
  return (
    <nav aria-label="Main navigation" className="flex shrink-0 items-center gap-1">
      <NavLink
        to="/chat"
        aria-label="Chat"
        title="Chat"
        className={({ isActive }) => `flex h-10 items-center justify-center gap-2 rounded-lg border px-2.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#667eea] sm:px-3 ${isActive ? 'border-[#dfe3f7] bg-[#eef0fb] text-[#4f5db8]' : 'border-transparent text-[#59617a] hover:border-[#e8eaf6] hover:bg-[#f8f9fc] hover:text-[#4f5db8]'}`}
      >
        <ChatIcon />
        <span className="hidden sm:inline">Chat</span>
      </NavLink>
      {admin && <>
      <NavLink
        to="/admin"
        end
        aria-label="Dashboard"
        title="Dashboard"
        className={({ isActive }) => `flex h-10 items-center justify-center gap-2 rounded-lg border px-2.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#667eea] sm:px-3 ${isActive ? 'border-[#dfe3f7] bg-[#eef0fb] text-[#4f5db8]' : 'border-transparent text-[#59617a] hover:border-[#e8eaf6] hover:bg-[#f8f9fc] hover:text-[#4f5db8]'}`}
      >
        <DashboardIcon />
        <span className="hidden sm:inline">Dashboard</span>
      </NavLink>
      <NavLink
        to="/admin/users"
        aria-label="Users"
        title="Users"
        className={({ isActive }) => `flex h-10 items-center justify-center gap-2 rounded-lg border px-2.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#667eea] sm:px-3 ${isActive ? 'border-[#dfe3f7] bg-[#eef0fb] text-[#4f5db8]' : 'border-transparent text-[#59617a] hover:border-[#e8eaf6] hover:bg-[#f8f9fc] hover:text-[#4f5db8]'}`}
      >
        <UsersIcon />
        <span className="hidden sm:inline">Users</span>
      </NavLink>
      </>}
    </nav>
  )
}

function DashboardIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c.5-2.8 2.4-4.5 5.5-4.5s5 1.7 5.5 4.5M16 5.5a3 3 0 010 5.8M16 14c2.4.3 3.8 2 4.2 4.5" strokeLinecap="round" />
    </svg>
  )
}

export default AdminNavigation
