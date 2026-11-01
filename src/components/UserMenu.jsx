import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getApiMessage } from '../api/chatApi'
import { useAuth } from '../auth/useAuth'
import { LogoutIcon, UserIcon } from './HeaderIcons'

function UserMenu() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const containerRef = useRef(null)
  const triggerRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false)
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const signOut = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    setLogoutError('')
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (requestError) {
      setLogoutError(getApiMessage(requestError))
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Open account menu"
        aria-expanded={open}
        aria-controls="account-menu"
        title="Account menu"
        onClick={() => {
          setOpen((current) => !current)
          setLogoutError('')
        }}
        className="flex h-10 w-10 items-center justify-center rounded-lg p-2 text-[#5c6bc0] transition hover:bg-[#eef0fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#667eea]"
      >
        <UserIcon />
      </button>
      {open && (
        <div id="account-menu" className="absolute right-0 top-full z-30 mt-2 w-48 overflow-hidden rounded-xl border border-[#e4e7f1] bg-white p-1.5 shadow-[0_14px_40px_rgba(34,43,90,0.16)]">
          <Link
            to="/account"
            onClick={() => setOpen(false)}
            className="flex min-h-10 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-[#394055] transition hover:bg-[#f3f4fc] hover:text-[#5c6bc0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#667eea]"
          >
            <UserIcon />
            <span>Profile</span>
          </Link>
          <button
            type="button"
            onClick={signOut}
            disabled={loggingOut}
            aria-busy={loggingOut}
            className="flex min-h-10 w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-[#394055] transition hover:bg-red-50 hover:text-[#c62828] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#667eea] disabled:cursor-wait disabled:opacity-60"
          >
            {loggingOut
              ? <span aria-hidden="true" className="ml-0.5 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              : <LogoutIcon />
            }
            <span>{loggingOut ? 'Signing out…' : 'Log out'}</span>
          </button>
          {logoutError && <p role="alert" className="mt-1 border-t border-[#eef0f8] px-3 py-2 text-xs text-red-700">{logoutError}</p>}
        </div>
      )}
    </div>
  )
}

export default UserMenu
