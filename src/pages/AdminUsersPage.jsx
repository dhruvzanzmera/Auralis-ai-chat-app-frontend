import { useCallback, useEffect, useState } from 'react'
import { chatApi } from '../api/chatApi'
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
  const [busyId, setBusyId] = useState('')
  const [loading, setLoading] = useState(true)

  const loadUsers = useCallback(async (page = 1) => {
    const { data } = await chatApi.get('/admin/users', {
      params: { page, limit: 10, search, role: role || undefined, status: status || undefined },
    })
    setUsers(Array.isArray(data) ? data : data.users || data.items || [])
    setPagination(data.pagination || { page: data.page || page, pages: data.pages || 1, total: data.total || 0 })
  }, [role, search, status])

  useEffect(() => {
    let active = true
    loadUsers().catch((requestError) => {
      if (active) setError(requestError.response?.data?.message || 'Could not load users.')
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [loadUsers])

  const openUser = async (user) => {
    setSelected(user)
    setUserUsage(null)
    setLoadingUserUsage(true)
    try {
      const [{ data: details }, { data: usageData }] = await Promise.all([
        chatApi.get(`/admin/users/${user._id}`),
        chatApi.get(`/admin/users/${user._id}/usage`),
      ])
      setSelected(details.user || details)
      setUserUsage(usageData)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load user usage.')
    } finally {
      setLoadingUserUsage(false)
    }
  }

  const updateUser = async (user, kind, value) => {
    setBusyId(user._id)
    setError('')
    try {
      const { data } = await chatApi.patch(`/admin/users/${user._id}/${kind}`,
        kind === 'status' ? { status: value } : { role: value })
      const updated = data.user || data
      setUsers((current) => current.map((item) => item._id === user._id ? { ...item, ...updated, [kind]: value } : item))
      setSelected((current) => current?._id === user._id ? { ...current, ...updated, [kind]: value } : current)
    } catch (requestError) {
      setError(requestError.response?.data?.message || `Could not update user ${kind}.`)
    } finally {
      setBusyId('')
    }
  }

  const changeFilter = (setter, value) => {
    setLoading(true)
    setUsers([])
    setError('')
    setter(value)
  }

  const changePage = async (page) => {
    setLoading(true)
    setUsers([])
    setError('')
    try {
      await loadUsers(page)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load users.')
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
            <div><h2 className="font-semibold text-[#1a1a2e]">User management</h2><p className="mt-1 text-xs text-[#8b93ad]">{loading ? 'Loading accounts…' : `${pagination.total} accounts`}</p></div>
            <div className="flex flex-wrap gap-2">
              <input aria-label="Search users" placeholder="Search name or email" value={search} onChange={(event) => changeFilter(setSearch, event.target.value)} className="w-48 rounded-lg border border-[#e0e3f7] px-3 py-2 text-xs outline-none focus:border-[#9fa8da]" />
              <select aria-label="Filter by role" value={role} onChange={(event) => changeFilter(setRole, event.target.value)} className="rounded-lg border border-[#e0e3f7] bg-white px-2 py-2 text-xs"><option value="">All roles</option><option value="USER">User</option><option value="ADMIN">Admin</option></select>
              <select aria-label="Filter by status" value={status} onChange={(event) => changeFilter(setStatus, event.target.value)} className="rounded-lg border border-[#e0e3f7] bg-white px-2 py-2 text-xs"><option value="">All statuses</option><option value="active">Active</option><option value="blocked">Blocked</option></select>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-xs">
              <thead><tr className="border-b border-[#eef0f8] text-[#8b93ad]"><th className="pb-3 font-medium">User</th><th className="pb-3 font-medium">Role</th><th className="pb-3 font-medium">Status</th><th className="pb-3 font-medium">Registered</th><th className="pb-3 font-medium">Last activity</th><th className="pb-3 text-right font-medium">Actions</th></tr></thead>
              <tbody>{loading ? <tr><td colSpan="6" className="py-8 text-center text-sm text-[#8b93ad]">Loading users…</td></tr> : users.map((user) => <tr key={user._id} className="border-b border-[#f4f5fa] text-[#394055]">
                <td className="py-3"><button onClick={() => openUser(user)} className="text-left hover:text-[#5c6bc0]"><span className="block font-semibold">{user.name}</span><span className="mt-0.5 block text-[#8b93ad]">{user.email}</span></button></td>
                <td className="py-3">{user.role || 'USER'}</td><td className="py-3 capitalize">{user.status || 'active'}</td><td className="py-3">{formatDate(user.createdAt)}</td><td className="py-3">{formatDate(user.lastActivityAt || user.lastActiveAt)}</td>
                <td className="py-3 text-right"><button disabled={busyId === user._id} onClick={() => updateUser(user, 'status', (user.status || 'active') === 'blocked' ? 'active' : 'blocked')} className="mr-2 rounded-lg border border-[#e0e3f7] px-2.5 py-1.5 hover:bg-[#f5f6ff] disabled:opacity-50">{user.status === 'blocked' ? 'Unblock' : 'Block'}</button><button disabled={busyId === user._id} onClick={() => updateUser(user, 'role', user.role === 'ADMIN' ? 'USER' : 'ADMIN')} className="rounded-lg border border-[#e0e3f7] px-2.5 py-1.5 hover:bg-[#f5f6ff] disabled:opacity-50">{user.role === 'ADMIN' ? 'Make user' : 'Make admin'}</button></td>
              </tr>)}</tbody>
            </table>
            {!loading && !users.length && <p className="py-8 text-center text-sm text-[#8b93ad]">No users match these filters.</p>}
          </div>
          <div className="mt-4 flex items-center justify-end gap-3 text-xs text-[#7986a8]">
            <button disabled={loading || pagination.page <= 1} onClick={() => changePage(pagination.page - 1)} className="rounded-lg border border-[#e0e3f7] px-3 py-1.5 disabled:opacity-40">Previous</button>
            <span>{loading ? 'Loading…' : `Page ${pagination.page} of ${pagination.pages}`}</span>
            <button disabled={loading || pagination.page >= pagination.pages} onClick={() => changePage(pagination.page + 1)} className="rounded-lg border border-[#e0e3f7] px-3 py-1.5 disabled:opacity-40">Next</button>
          </div>
        </section>
        {selected && <UserDetails user={selected} usage={userUsage} loadingUsage={loadingUserUsage} onClose={() => { setSelected(null); setUserUsage(null) }} />}
      </section>
    </main>
  )
}

function UserDetails({ user, usage, loadingUsage, onClose }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1a2e]/40 p-4" onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section role="dialog" aria-modal="true" aria-labelledby="user-details-title" className="max-h-[85vh] w-full max-w-lg overflow-auto rounded-2xl bg-white p-6 shadow-2xl">
      <div className="flex justify-between gap-4"><div><h2 id="user-details-title" className="text-lg font-bold text-[#1a1a2e]">{user.name}</h2><p className="text-sm text-[#8b93ad]">{user.email}</p></div><button onClick={onClose} aria-label="Close details" className="h-8 w-8 rounded-lg text-[#7986a8] hover:bg-[#f0f2ff]">×</button></div>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm"><DetailItem label="Role" value={user.role} /><DetailItem label="Status" value={user.status} /><DetailItem label="Joined" value={formatDate(user.createdAt)} /><DetailItem label="Last activity" value={formatDate(user.lastActivityAt || user.lastActiveAt)} /></dl>
      <h3 className="mt-6 font-semibold text-[#1a1a2e]">Usage</h3>
      {usage ? <div className="mt-3 grid grid-cols-2 gap-3">
        <Metric title="Total prompts" value={usage.totalPrompts ?? usage.totalRequests ?? 0} />
        <Metric title="Tokens" value={usage.totalTokens ?? usage.tokens?.totalTokens ?? 0} />
        <Metric title="Today" value={usage.today?.prompts ?? usage.dailyPrompts ?? 0} />
        <Metric title="This week" value={usage.week?.prompts ?? usage.weeklyPrompts ?? 0} />
      </div> : <p role={loadingUsage ? 'status' : undefined} className="mt-3 text-sm text-[#8b93ad]">{loadingUsage ? 'Loading usage…' : 'Could not load usage data.'}</p>}
      {usage?.recentRequests?.length > 0 && <div className="mt-4 space-y-2">{usage.recentRequests.slice(0, 8).map((request, index) => <div key={request._id || index} className="flex justify-between gap-3 border-t border-[#f0f2f8] pt-2 text-xs"><span className="truncate text-[#566078]">{request.promptText || request.model || 'AI request'}</span><span className="shrink-0 text-[#8b93ad]">{Number(request.totalTokens || 0).toLocaleString()} tokens</span></div>)}</div>}
    </section>
  </div>
}

function Metric({ title, value }) {
  return <div className="rounded-xl border border-[#e8eaf6] bg-[#fcfcff] p-3"><p className="text-[10px] font-medium text-[#8b93ad]">{title}</p><p className="mt-1 text-lg font-bold text-[#272b4a]">{typeof value === 'number' ? value.toLocaleString() : value}</p></div>
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
