import { useCallback, useEffect, useState } from 'react'
import { chatApi, getApiMessage } from '../api/chatApi'
import LoadingIndicator from '../components/LoadingIndicator'
import PageHeader from '../components/PageHeader'

function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState(null)
  const [userUsage, setUserUsage] = useState(null)
  const [loadingUserUsage, setLoadingUserUsage] = useState(false)
  const [error, setError] = useState('')
  const [emptyMessage, setEmptyMessage] = useState('')
  const [usageError, setUsageError] = useState('')
  const [busyId, setBusyId] = useState('')
  const [busyKind, setBusyKind] = useState('')
  const [loading, setLoading] = useState(true)

  const loadUsers = useCallback(async (page = 1) => {
    const { data } = await chatApi.get('/admin/users', {
      params: { page, limit: 10, search, role: role || undefined, status: status || undefined },
    })
    setUsers(Array.isArray(data) ? data : data.users || data.items || [])
    setEmptyMessage(Array.isArray(data) ? '' : data.message || '')
    setPagination(data.pagination || { page: data.page || page, pages: data.pages || 1, total: data.total || 0 })
  }, [role, search, status])

  useEffect(() => {
    let active = true
    loadUsers().catch((requestError) => {
      if (active) setError(getApiMessage(requestError))
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [loadUsers])

  const openUser = async (user) => {
    setError('')
    setSelected(user)
    setUserUsage(null)
    setUsageError('')
    setLoadingUserUsage(true)
    try {
      const [{ data: details }, { data: usageData }] = await Promise.all([
        chatApi.get(`/admin/users/${user._id}`),
        chatApi.get(`/admin/users/${user._id}/usage`),
      ])
      setSelected(details.user || details)
      setUserUsage(usageData)
    } catch (requestError) {
      const message = getApiMessage(requestError)
      setError(message)
      setUsageError(message)
    } finally {
      setLoadingUserUsage(false)
    }
  }

  const updateUser = async (user, kind, value) => {
    setBusyId(user._id)
    setBusyKind(kind)
    setError('')
    try {
      const { data } = await chatApi.patch(`/admin/users/${user._id}/${kind}`,
        kind === 'status' ? { status: value } : { role: value })
      const updated = data.user || data
      setUsers((current) => current.map((item) => item._id === user._id ? { ...item, ...updated, [kind]: value } : item))
      setSelected((current) => current?._id === user._id ? { ...current, ...updated, [kind]: value } : current)
    } catch (requestError) {
      setError(getApiMessage(requestError))
    } finally {
      setBusyId('')
      setBusyKind('')
    }
  }

  const changeFilter = (setter, value) => {
    setLoading(true)
    setUsers([])
    setEmptyMessage('')
    setError('')
    setter(value)
  }

  const changePage = async (page) => {
    setLoading(true)
    setUsers([])
    setEmptyMessage('')
    setError('')
    try {
      await loadUsers(page)
    } catch (requestError) {
      setError(getApiMessage(requestError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="h-dvh overflow-y-auto bg-[#f8f9fc]">
      <PageHeader title="User management" admin />
      <section className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#7986a8]">Auralis administration</p>
          <h1 className="mt-1 text-2xl font-bold text-[#1a1a2e]">Manage accounts</h1>
        </div>
        {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <section className="rounded-2xl border border-[#e8eaf6] bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="font-semibold text-[#1a1a2e]">User management</h2><p className="mt-1 text-xs text-[#8b93ad]">{loading ? '' : `${pagination.total} accounts`}</p></div>
            <div className="flex flex-wrap gap-2">
              <input aria-label="Search users" placeholder="Search name or email" value={search} onChange={(event) => changeFilter(setSearch, event.target.value)} className="w-48 rounded-lg border border-[#e0e3f7] px-3 py-2 text-xs outline-none focus:border-[#9fa8da]" />
              <select aria-label="Filter by role" value={role} onChange={(event) => changeFilter(setRole, event.target.value)} className="rounded-lg border border-[#e0e3f7] bg-white px-2 py-2 text-xs"><option value="">All roles</option><option value="USER">User</option><option value="ADMIN">Admin</option></select>
              <select aria-label="Filter by status" value={status} onChange={(event) => changeFilter(setStatus, event.target.value)} className="rounded-lg border border-[#e0e3f7] bg-white px-2 py-2 text-xs"><option value="">All statuses</option><option value="active">Active</option><option value="blocked">Blocked</option></select>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-xs">
              <thead><tr className="border-b border-[#eef0f8] text-[#8b93ad]"><th className="pb-3 font-medium">User</th><th className="pb-3 font-medium">Role</th><th className="pb-3 font-medium">Status</th><th className="pb-3 font-medium">Registered</th><th className="pb-3 font-medium">Last activity</th><th className="pb-3 text-right font-medium">Actions</th></tr></thead>
              <tbody>{loading ? <tr><td colSpan="6" className="py-8"><LoadingIndicator label="Loading accounts…" /></td></tr> : users.map((user) => <tr key={user._id} className="border-b border-[#f4f5fa] text-[#394055]">
                <td className="py-3"><button onClick={() => openUser(user)} className="text-left hover:text-[#5c6bc0]"><span className="block font-semibold">{user.name}</span><span className="mt-0.5 block text-[#8b93ad]">{user.email}</span></button></td>
                <td className="py-3">{user.role || 'USER'}</td><td className="py-3 capitalize">{user.status || 'active'}</td><td className="py-3">{formatDate(user.createdAt)}</td><td className="py-3">{formatDate(user.lastActivityAt || user.lastActiveAt)}</td>
                <td className="py-3 text-right">
                  <button disabled={busyId === user._id} aria-busy={busyId === user._id && busyKind === 'status'} onClick={() => updateUser(user, 'status', (user.status || 'active') === 'blocked' ? 'active' : 'blocked')} className="mr-2 inline-flex items-center gap-1.5 rounded-lg border border-[#e0e3f7] px-2.5 py-1.5 hover:bg-[#f5f6ff] disabled:opacity-50">
                    {busyId === user._id && busyKind === 'status' && <span aria-hidden="true" className="h-3 w-3 animate-spin rounded-full border-2 border-[#e0e3f7] border-t-[#667eea]" />}
                    {busyId === user._id && busyKind === 'status' ? 'Updating…' : user.status === 'blocked' ? 'Unblock' : 'Block'}
                  </button>
                  <button disabled={busyId === user._id} aria-busy={busyId === user._id && busyKind === 'role'} onClick={() => updateUser(user, 'role', user.role === 'ADMIN' ? 'USER' : 'ADMIN')} className="inline-flex items-center gap-1.5 rounded-lg border border-[#e0e3f7] px-2.5 py-1.5 hover:bg-[#f5f6ff] disabled:opacity-50">
                    {busyId === user._id && busyKind === 'role' && <span aria-hidden="true" className="h-3 w-3 animate-spin rounded-full border-2 border-[#e0e3f7] border-t-[#667eea]" />}
                    {busyId === user._id && busyKind === 'role' ? 'Updating…' : user.role === 'ADMIN' ? 'Make user' : 'Make admin'}
                  </button>
                </td>
              </tr>)}</tbody>
            </table>
            {!loading && !users.length && <p className="py-8 text-center text-sm text-[#8b93ad]">{emptyMessage}</p>}
          </div>
          <div className="mt-4 flex items-center justify-end gap-3 text-xs text-[#7986a8]">
            <button disabled={loading || pagination.page <= 1} onClick={() => changePage(pagination.page - 1)} className="rounded-lg border border-[#e0e3f7] px-3 py-1.5 disabled:opacity-40">Previous</button>
            <span>{loading ? '' : `Page ${pagination.page} of ${pagination.pages}`}</span>
            <button disabled={loading || pagination.page >= pagination.pages} onClick={() => changePage(pagination.page + 1)} className="rounded-lg border border-[#e0e3f7] px-3 py-1.5 disabled:opacity-40">Next</button>
          </div>
        </section>
        {selected && <UserDetails user={selected} usage={userUsage} usageError={usageError} loadingUsage={loadingUserUsage} onClose={() => { setSelected(null); setUserUsage(null); setUsageError('') }} />}
      </section>
    </main>
  )
}

function UserDetails({ user, usage, usageError, loadingUsage, onClose }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1a2e]/40 p-4" onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section role="dialog" aria-modal="true" aria-labelledby="user-details-title" className="max-h-[85vh] w-full max-w-lg overflow-auto rounded-2xl bg-white p-6 shadow-2xl">
      <div className="flex justify-between gap-4"><div><h2 id="user-details-title" className="text-lg font-bold text-[#1a1a2e]">{user.name}</h2><p className="text-sm text-[#8b93ad]">{user.email}</p></div><button onClick={onClose} aria-label="Close details" className="h-8 w-8 rounded-lg text-[#7986a8] hover:bg-[#f0f2ff]">×</button></div>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm"><DetailItem label="Role" value={user.role} /><DetailItem label="Status" value={user.status} /><DetailItem label="Joined" value={formatDate(user.createdAt)} /><DetailItem label="Last activity" value={formatDate(user.lastActivityAt || user.lastActiveAt)} /></dl>
      <h3 className="mt-6 font-semibold text-[#1a1a2e]">Usage</h3>
      {usage ? <DailyPromptChart rows={usage.series || []} message={usage.message} /> : loadingUsage
        ? <LoadingIndicator label="Loading user usage…" className="min-h-32" />
        : usageError && <p role="alert" className="mt-3 text-sm text-red-700">{usageError}</p>}
    </section>
  </div>
}

function DailyPromptChart({ rows, message }) {
  if (rows.length && rows.every((row) => Number(row.count || 0) === 0)) {
    return <p className="mt-3 text-sm text-[#8b93ad]">{message}</p>
  }
  const maximum = Math.max(1, ...rows.map((row) => Number(row.count || 0)))
  return <div className="mt-3">
    <p className="text-xs text-[#8b93ad]">Prompt count · last 7 days · UTC</p>
    <div className="mt-3 flex h-28 items-end gap-2 border-b border-[#edf0f8] pb-1">
      {rows.map((row) => <div key={row.date} className="flex h-full min-w-0 flex-1 flex-col justify-end" title={`${row.date}: ${row.count} prompts`}>
        <span className="mb-1 text-center text-[10px] text-[#8b93ad]">{row.count}</span>
        <div className="mx-auto w-full max-w-7 rounded-t bg-gradient-to-t from-[#764ba2] to-[#667eea]" style={{ height: `${Math.max(3, Number(row.count || 0) / maximum * 75)}%` }} />
        <span className="mt-2 truncate text-center text-[9px] text-[#8b93ad]">{new Date(`${row.date}T00:00:00Z`).toLocaleDateString(undefined, { weekday: 'short', timeZone: 'UTC' })}</span>
      </div>)}
    </div>
  </div>
}

function DetailItem({ label, value }) {
  return <div className="rounded-xl bg-[#f8f9fc] p-3"><dt className="text-[10px] text-[#8b93ad]">{label}</dt><dd className="mt-1 text-sm font-medium capitalize text-[#394055]">{value || '—'}</dd></div>
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString(undefined, { timeZone: 'UTC' })
}

export default AdminUsersPage
