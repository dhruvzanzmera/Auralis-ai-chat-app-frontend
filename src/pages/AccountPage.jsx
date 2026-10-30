import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { chatApi } from '../api/chatApi'
import { useAuth } from '../auth/useAuth'
import LoadingIndicator from '../components/LoadingIndicator'
import PageHeader from '../components/PageHeader'

function AccountPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [usage, setUsage] = useState(null)
  const [history, setHistory] = useState([])
  const [dailySeries, setDailySeries] = useState([])
  const [historyPage, setHistoryPage] = useState(1)
  const [historyPages, setHistoryPages] = useState(1)
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' })
  const [historyLoadingPage, setHistoryLoadingPage] = useState(null)
  const [busy, setBusy] = useState(false)
  const [loadingUsage, setLoadingUsage] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadUsage = useCallback(async (page = 1) => {
    try {
      const [{ data: summary }, { data: logs }, { data: daily }] = await Promise.all([
        chatApi.get('/usage/me'),
        chatApi.get('/usage/me/history', { params: { page, limit: 10 } }),
        chatApi.get('/usage/me/daily', { params: { range: '7d' } }),
      ])
      setUsage(summary)
      setHistory(Array.isArray(logs) ? logs : logs.items || logs.logs || [])
      setDailySeries(daily.series || [])
      setHistoryPage(logs.page || page)
      setHistoryPages(logs.pages || 1)
    } finally {
      setLoadingUsage(false)
    }
  }, [])

  useEffect(() => {
    loadUsage().catch((requestError) => setError(requestError.response?.data?.message || 'Could not load usage data.'))
  }, [loadUsage])

  const changePassword = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const { data } = await chatApi.put('/auth/change-password', form)
      setNotice(data.message || 'Password changed successfully.')
      setForm({ currentPassword: '', newPassword: '' })
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not change your password.')
    } finally {
      setBusy(false)
    }
  }

  const changeHistoryPage = async (page) => {
    setHistoryLoadingPage(page)
    setLoadingUsage(true)
    setError('')
    try {
      await loadUsage(page)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load usage history.')
    } finally {
      setHistoryLoadingPage(null)
    }
  }

  const totalPrompts = usage?.totalPrompts ?? usage?.totalRequests ?? usage?.total ?? 0
  const metricValue = (value) => usage ? value : '—'

  return (
    <main className="h-dvh overflow-y-auto bg-[#f8f9fc]">
      <PageHeader title="Account & usage" />
      <section className="mx-auto w-full max-w-5xl px-4 py-7 sm:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-xs font-semibold uppercase tracking-[.16em] text-[#7986a8]">Your workspace</p><h1 className="mt-1 text-2xl font-bold text-[#1a1a2e]">Account & usage</h1></div>
        <button onClick={() => navigate('/chat')} className="rounded-xl border border-[#e0e3f7] bg-white px-4 py-2 text-sm font-medium text-[#4a5580] hover:bg-[#f5f6ff]">Back to chat</button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric title="Total prompts" value={metricValue(totalPrompts)} loading={loadingUsage && !usage} />
        <Metric title="Prompts today" value={metricValue(usage?.today?.prompts ?? usage?.dailyPrompts ?? 0)} loading={loadingUsage && !usage} />
        <Metric title="Prompts this week" value={metricValue(usage?.week?.prompts ?? usage?.weeklyPrompts ?? 0)} loading={loadingUsage && !usage} />
        <Metric title="Prompts this month" value={metricValue(usage?.month?.prompts ?? usage?.monthlyPrompts ?? 0)} loading={loadingUsage && !usage} />
      </div>
      <section className="mt-5 rounded-2xl border border-[#e8eaf6] bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-[#1a1a2e]">Daily prompt activity</h2>
        <p className="mt-1 text-xs text-[#8b93ad]">Last 7 days · UTC</p>
        <DailyChart rows={dailySeries} loading={loadingUsage} />
        </section>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <section className="rounded-2xl border border-[#e8eaf6] bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-[#1a1a2e]">Recent AI requests</h2>
          {history.length ? <div className="mt-4 divide-y divide-[#f0f2f8]">
            {history.map((log, index) => <div key={log._id || index} className="flex items-center justify-between gap-3 py-3 text-sm">
              <div className="min-w-0"><p className="truncate font-medium text-[#394055]">{log.promptText || 'Prompt content not retained'}</p><p className="mt-1 text-xs text-[#8b93ad]">{formatDate(log.createdAt)} · {log.model || 'AI model'}</p></div>
              <div className="shrink-0 text-right"><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${log.requestStatus === 'success' || log.requestStatus === 'succeeded' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{log.requestStatus || 'recorded'}</span><p className="mt-1 text-[11px] text-[#8b93ad]">{Number(log.totalTokens || 0).toLocaleString()} tokens</p></div>
            </div>)}
          </div> : loadingUsage
            ? <LoadingIndicator label="Loading recent AI requests…" className="py-8" />
            : <EmptyState text={error || 'No AI requests recorded yet.'} />}
          {historyPages > 1 && <div className="mt-3 flex items-center justify-end gap-3 border-t border-[#f0f2f8] pt-3 text-xs text-[#7986a8]">
            <button disabled={loadingUsage || historyPage <= 1} onClick={() => changeHistoryPage(historyPage - 1)} className="flex min-w-20 items-center justify-center gap-1.5 rounded-lg border border-[#e0e3f7] px-3 py-1.5 disabled:opacity-40">
              {historyLoadingPage === historyPage - 1 && <span aria-hidden="true" className="h-3 w-3 animate-spin rounded-full border-2 border-[#e0e3f7] border-t-[#667eea]" />}
              {historyLoadingPage === historyPage - 1 ? 'Loading…' : 'Previous'}
            </button>
            <span>{loadingUsage && historyLoadingPage !== null ? 'Loading history…' : `Page ${historyPage} of ${historyPages}`}</span>
            <button disabled={loadingUsage || historyPage >= historyPages} onClick={() => changeHistoryPage(historyPage + 1)} className="flex min-w-20 items-center justify-center gap-1.5 rounded-lg border border-[#e0e3f7] px-3 py-1.5 disabled:opacity-40">
              {historyLoadingPage === historyPage + 1 && <span aria-hidden="true" className="h-3 w-3 animate-spin rounded-full border-2 border-[#e0e3f7] border-t-[#667eea]" />}
              {historyLoadingPage === historyPage + 1 ? 'Loading…' : 'Next'}
            </button>
          </div>}
        </section>
        <div className="space-y-5">
          <section className="rounded-2xl border border-[#e8eaf6] bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-[#1a1a2e]">Profile</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <ProfileRow label="Name" value={user.name} />
              <ProfileRow label="Email" value={user.email} />
              <ProfileRow label="Account" value={user.status || 'active'} />
              <ProfileRow label="Member since" value={formatDate(user.createdAt)} />
            </dl>
          </section>
          <section className="rounded-2xl border border-[#e8eaf6] bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-[#1a1a2e]">Change password</h2>
            <form onSubmit={changePassword} className="mt-4 space-y-3">
              <input aria-label="Current password" type="password" autoComplete="current-password" minLength="10" required placeholder="Current password" value={form.currentPassword} onChange={(event) => setForm({ ...form, currentPassword: event.target.value })} className="w-full rounded-xl border border-[#e0e3f7] px-3 py-2.5 text-sm outline-none focus:border-[#9fa8da]" />
              <input aria-label="New password" type="password" autoComplete="new-password" minLength="10" maxLength="128" required placeholder="New password (10+ characters)" value={form.newPassword} onChange={(event) => setForm({ ...form, newPassword: event.target.value })} className="w-full rounded-xl border border-[#e0e3f7] px-3 py-2.5 text-sm outline-none focus:border-[#9fa8da]" />
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

function Metric({ title, value, loading = false }) {
  const displayValue = typeof value === 'number' ? value.toLocaleString() : value
  return <div className="rounded-2xl border border-[#e8eaf6] bg-white p-4 shadow-sm"><p className="text-xs font-medium text-[#8b93ad]">{title}</p><p className="mt-2 flex min-h-8 items-center text-2xl font-bold text-[#272b4a]" aria-live="polite">{loading ? <LoadingIndicator label="Loading" /> : displayValue}</p></div>
}

function ProfileRow({ label, value }) {
  return <div className="flex justify-between gap-3"><dt className="text-[#8b93ad]">{label}</dt><dd className="truncate font-medium capitalize text-[#394055]">{value || '—'}</dd></div>
}

function EmptyState({ text }) {
  if (!text) return null
  return <p className="py-8 text-center text-sm text-[#8b93ad]">{text}</p>
}

function DailyChart({ rows, loading }) {
  const maximum = Math.max(1, ...rows.map((row) => Number(row.count || 0)))
  return rows.length ? <div className="mt-4 flex h-32 items-end gap-2 border-b border-[#edf0f8] pb-1">
    {rows.map((row) => <div key={row.date} className="flex h-full min-w-0 flex-1 flex-col justify-end" title={`${row.date}: ${row.count} prompts`}>
      <span className="mb-1 text-center text-[10px] text-[#8b93ad]">{row.count}</span>
      <div className="mx-auto w-full max-w-8 rounded-t bg-gradient-to-t from-[#764ba2] to-[#667eea]" style={{ height: `${Math.max(3, Number(row.count || 0) / maximum * 75)}%` }} />
      <span className="mt-2 truncate text-center text-[9px] text-[#8b93ad]">{new Date(`${row.date}T00:00:00Z`).toLocaleDateString(undefined, { weekday: 'short', timeZone: 'UTC' })}</span>
    </div>)}
  </div> : loading
    ? <LoadingIndicator label="Loading daily activity…" className="min-h-32" />
    : <EmptyState text="No daily activity to show yet." />
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : '—'
}

export default AccountPage
