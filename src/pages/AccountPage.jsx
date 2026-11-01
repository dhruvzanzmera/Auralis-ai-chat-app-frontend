import { useCallback, useEffect, useState } from 'react'
import { chatApi, getApiMessage } from '../api/chatApi'
import { useAuth } from '../auth/useAuth'
import LoadingIndicator from '../components/LoadingIndicator'
import PageHeader from '../components/PageHeader'
import PasswordInput from '../components/PasswordInput'

function AccountPage() {
  const { user } = useAuth()
  const [dailySeries, setDailySeries] = useState([])
  const [dailyUsageMessage, setDailyUsageMessage] = useState('')
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' })
  const [busy, setBusy] = useState(false)
  const [loadingUsage, setLoadingUsage] = useState(true)
  const [usageError, setUsageError] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadUsage = useCallback(async () => {
    try {
      const { data } = await chatApi.get('/usage/me/daily', { params: { range: '7d' } })
      setDailySeries(data.series || [])
      setDailyUsageMessage(data.message || '')
    } finally {
      setLoadingUsage(false)
    }
  }, [])

  useEffect(() => {
    loadUsage().catch((requestError) => setUsageError(getApiMessage(requestError)))
  }, [loadUsage])

  const changePassword = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const { data } = await chatApi.put('/auth/change-password', form)
      setNotice(data.message)
      setForm({ currentPassword: '', newPassword: '' })
    } catch (requestError) {
      setError(getApiMessage(requestError))
    } finally {
      setBusy(false)
    }
  }

  const initials = user.name?.trim().charAt(0).toUpperCase() || 'U'

  return (
    <main className="h-dvh overflow-y-auto bg-[#f8f9fc]">
      <PageHeader title="Account & usage" />
      <section className="mx-auto w-full max-w-5xl px-4 py-7 sm:px-8">
      <div className="mb-6">
        <div><p className="text-xs font-semibold uppercase tracking-[.16em] text-[#7986a8]">Your workspace</p><h1 className="mt-1 text-2xl font-bold text-[#1a1a2e]">Account & usage</h1></div>
      </div>
      <section className="mt-5 rounded-2xl border border-[#e8eaf6] bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-[#1a1a2e]">Daily prompt activity</h2>
        <p className="mt-1 text-xs text-[#8b93ad]">Last 7 days · UTC</p>
        <DailyChart rows={dailySeries} message={dailyUsageMessage} loading={loadingUsage} error={usageError} />
      </section>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="overflow-hidden rounded-2xl border border-[#e8eaf6] bg-white shadow-sm">
          <div className="bg-gradient-to-r from-[#f0f2ff] to-[#f7f2ff] px-5 py-6 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#7986a8]">Your account</p>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#667eea] to-[#764ba2] text-xl font-bold text-white shadow-md shadow-[#667eea]/20">
                {initials}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-[#1a1a2e]">{user.name}</h2>
                <p className="truncate text-sm text-[#68718b]">{user.email}</p>
              </div>
            </div>
          </div>
          <dl className="grid gap-px bg-[#eef0f8] sm:grid-cols-2">
            <ProfileDetail label="Account status" value={user.status || 'Active'} />
            <ProfileDetail label="Role" value={user.role || 'User'} />
            <ProfileDetail label="Member since" value={formatDate(user.createdAt)} />
            <ProfileDetail label="Last active" value={formatDate(user.lastActivityAt)} />
          </dl>
        </section>
        <div>
          <section className="rounded-2xl border border-[#e8eaf6] bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-[#1a1a2e]">Change password</h2>
            <form onSubmit={changePassword} className="mt-4 space-y-3">
              <PasswordInput aria-label="Current password" autoComplete="current-password" minLength="10" required placeholder="Current password" value={form.currentPassword} onChange={(event) => setForm({ ...form, currentPassword: event.target.value })} className="w-full rounded-xl border border-[#e0e3f7] pl-3 py-2.5 text-sm outline-none focus:border-[#9fa8da]" />
              <PasswordInput aria-label="New password" autoComplete="new-password" minLength="10" maxLength="128" required placeholder="New password (10+ characters)" value={form.newPassword} onChange={(event) => setForm({ ...form, newPassword: event.target.value })} className="w-full rounded-xl border border-[#e0e3f7] pl-3 py-2.5 text-sm outline-none focus:border-[#9fa8da]" />
              {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
              {notice && <p role="status" className="text-xs text-green-700">{notice}</p>}
              <button disabled={busy} className="rounded-xl bg-[#5c6bc0] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{busy ? 'Updating…' : 'Update password'}</button>
            </form>
          </section>
        </div>
      </div>
    </section>
    </main>
  )
}

function ProfileDetail({ label, value }) {
  return <div className="bg-white px-5 py-4">
    <dt className="text-xs font-medium text-[#8b93ad]">{label}</dt>
    <dd className="mt-1 break-words text-sm font-semibold capitalize text-[#394055]">{value || '—'}</dd>
  </div>
}

function EmptyState({ text }) {
  return <p className="py-8 text-center text-sm text-[#8b93ad]">{text}</p>
}

function DailyChart({ rows, message, loading, error }) {
  if (error) return <p role="alert" className="py-8 text-center text-sm text-red-700">{error}</p>
  if (!loading && rows.length && rows.every((row) => Number(row.count || 0) === 0)) {
    return <EmptyState text={message} />
  }
  const maximum = Math.max(1, ...rows.map((row) => Number(row.count || 0)))
  return rows.length ? <div className="mt-4 flex h-32 items-end gap-2 border-b border-[#edf0f8] pb-1">
    {rows.map((row) => <div key={row.date} className="flex h-full min-w-0 flex-1 flex-col justify-end" title={`${row.date}: ${row.count} prompts`}>
      <span className="mb-1 text-center text-[10px] text-[#8b93ad]">{row.count}</span>
      <div className="mx-auto w-full max-w-8 rounded-t bg-gradient-to-t from-[#764ba2] to-[#667eea]" style={{ height: `${Math.max(3, Number(row.count || 0) / maximum * 75)}%` }} />
      <span className="mt-2 truncate text-center text-[9px] text-[#8b93ad]">{new Date(`${row.date}T00:00:00Z`).toLocaleDateString(undefined, { weekday: 'short', timeZone: 'UTC' })}</span>
    </div>)}
  </div> : loading
    ? <LoadingIndicator label="Loading daily activity…" className="min-h-32" />
    : <EmptyState text={message} />
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
}

export default AccountPage
