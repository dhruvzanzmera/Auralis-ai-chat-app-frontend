import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { chatApi } from '../api/chatApi'
import PageHeader from '../components/PageHeader'

function AdminDashboardPage() {
  const navigate = useNavigate()
  const [range, setRange] = useState('7d')
  const [bucket, setBucket] = useState('daily')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [dashboard, setDashboard] = useState(null)
  const [analytics, setAnalytics] = useState({})
  const [error, setError] = useState('')
  const [loadingData, setLoadingData] = useState(true)

  const loadDashboard = useCallback(async () => {
    if (range === 'custom' && (!customStart || !customEnd)) return
    const params = range === 'custom'
      ? { range, startDate: customStart, endDate: customEnd, bucket }
      : { range, bucket }
    const [overview, prompts, registrations, tokens, models, errors] = await Promise.all([
      chatApi.get('/admin/dashboard', { params }),
      chatApi.get('/admin/analytics/prompts', { params }),
      chatApi.get('/admin/analytics/users', { params }),
      chatApi.get('/admin/analytics/tokens', { params }),
      chatApi.get('/admin/analytics/models', { params }),
      chatApi.get('/admin/analytics/errors', { params }),
    ])
    setDashboard(overview.data)
    setAnalytics({
      prompts: prompts.data,
      registrations: registrations.data,
      tokens: tokens.data,
      models: models.data,
      errors: errors.data,
    })
  }, [range, customStart, customEnd, bucket])

  const loadData = useCallback(async () => {
    try {
      await loadDashboard()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load administrator analytics.')
    } finally {
      setLoadingData(false)
    }
  }, [loadDashboard])

  useEffect(() => {
    loadData()
  }, [loadData])

  const updateFilter = (setter, value) => {
    setLoadingData(true)
    setError('')
    setDashboard(null)
    setAnalytics({})
    setter(value)
  }

  const metrics = dashboard?.metrics || dashboard?.overview || dashboard || {}
  const daily = analytics.prompts || dashboard?.dailyPrompts || dashboard?.promptSeries || dashboard?.prompts || []
  const chartRows = extractRows(daily)
  const registrationRows = extractRows(analytics.registrations)
  const modelRows = extractRows(analytics.models)
  const errorSummary = analytics.errors?.summary || analytics.errors || {}
  const today = metrics.promptsToday ?? metrics.todayPrompts ?? 0
  const activeUsers = metrics.activeUsers ?? 0
  const totalPrompts = metrics.totalPrompts ?? metrics.promptCount ?? 0
  const avgResponse = metrics.averageResponseTime ?? metrics.avgResponseTime ?? 0
  const displayMetric = (value) => loadingData ? 'Loading…' : dashboard ? value : '—'

  return (
    <main className="h-dvh overflow-y-auto bg-[#f8f9fc]">
      <PageHeader title="Administration" admin />
      <section className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-xs font-semibold uppercase tracking-[.16em] text-[#7986a8]">Auralis administration</p><h1 className="mt-1 text-2xl font-bold text-[#1a1a2e]">Usage dashboard</h1></div>
        <div className="flex flex-wrap gap-2">
          <select aria-label="Analytics range" value={range} onChange={(event) => updateFilter(setRange, event.target.value)} className="rounded-xl border border-[#e0e3f7] bg-white px-3 py-2 text-sm text-[#394055]">
            <option value="today">Today</option><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option><option value="month">This month</option><option value="custom">Custom range</option>
          </select>
          {range === 'custom' && <>
            <input aria-label="Start date" type="date" value={customStart} onChange={(event) => updateFilter(setCustomStart, event.target.value)} className="rounded-xl border border-[#e0e3f7] bg-white px-2 py-2 text-xs text-[#394055]" />
            <input aria-label="End date" type="date" value={customEnd} onChange={(event) => updateFilter(setCustomEnd, event.target.value)} className="rounded-xl border border-[#e0e3f7] bg-white px-2 py-2 text-xs text-[#394055]" />
          </>}
          <select aria-label="Chart interval" value={bucket} onChange={(event) => updateFilter(setBucket, event.target.value)} className="rounded-xl border border-[#e0e3f7] bg-white px-3 py-2 text-sm text-[#394055]">
            <option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option>
          </select>
          <button onClick={() => navigate('/chat')} className="rounded-xl border border-[#e0e3f7] bg-white px-4 py-2 text-sm font-medium text-[#4a5580] hover:bg-[#f5f6ff]">Back to chat</button>
        </div>
      </div>
      {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Metric title="Registered users" value={displayMetric(metrics.totalUsers ?? 0)} />
        <Metric title="Active users" value={displayMetric(activeUsers)} />
        <Metric title="Blocked users" value={displayMetric(metrics.blockedUsers ?? 0)} />
        <Metric title="Total prompts" value={displayMetric(totalPrompts)} />
        <Metric title="Prompts today" value={displayMetric(today)} />
        <Metric title="Prompts this week" value={displayMetric(metrics.promptsThisWeek ?? metrics.weeklyPrompts ?? 0)} />
        <Metric title="Prompts this month" value={displayMetric(metrics.promptsThisMonth ?? metrics.monthlyPrompts ?? 0)} />
        <Metric title="Successful / failed" value={dashboard ? displayMetric(`${metrics.successfulRequests ?? 0} / ${metrics.failedRequests ?? 0}`) : displayMetric('—')} />
        <Metric title="Avg. response time" value={dashboard ? displayMetric(`${Number(avgResponse).toFixed(0)} ms`) : displayMetric('—')} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
        <section className="rounded-2xl border border-[#e8eaf6] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between"><div><h2 className="font-semibold text-[#1a1a2e]">Prompt activity</h2><p className="mt-1 text-xs text-[#8b93ad]">Requests per reporting day · UTC</p></div><span className="rounded-full bg-[#f0f2ff] px-2.5 py-1 text-xs text-[#5c6bc0]">{range}</span></div>
          {chartRows.length ? <div className="mt-5 flex h-44 items-end gap-2 border-b border-[#edf0f8] pb-1">
            {chartRows.map((item, index) => {
              const count = Number(item.count ?? item.prompts ?? item.total ?? 0)
              const maximum = Math.max(1, ...chartRows.map((row) => Number(row.count ?? row.prompts ?? row.total ?? 0)))
              return <div key={item.date || item._id || index} className="flex h-full min-w-0 flex-1 flex-col justify-end">
                <span className="mb-1 text-center text-[10px] text-[#8b93ad]">{count}</span>
                <div title={`${item.date || item._id || ''}: ${count} prompts`} className="mx-auto w-full max-w-10 rounded-t-md bg-gradient-to-t from-[#764ba2] to-[#667eea]" style={{ height: `${Math.max(3, count / maximum * 78)}%` }} />
                <span className="mt-2 truncate text-center text-[9px] text-[#8b93ad]">{formatTick(item.date || item._id)}</span>
              </div>
            })}
          </div> : <EmptyState text={loadingData ? 'Loading prompt activity…' : 'No prompt activity in this range.'} />}
        </section>
        <section className="rounded-2xl border border-[#e8eaf6] bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-[#1a1a2e]">Recent usage leaders</h2>
          {dashboard?.mostActiveUsers?.length ? <div className="mt-3 divide-y divide-[#f0f2f8]">
            {dashboard.mostActiveUsers.slice(0, 6).map((item, index) => <div key={item._id || index} className="flex justify-between gap-3 py-3 text-sm"><span className="truncate text-[#394055]">{item.name || item.email || 'User'}</span><span className="font-semibold text-[#5c6bc0]">{item.prompts ?? item.count ?? item.totalPrompts ?? 0} prompts</span></div>)}
          </div> : <EmptyState text={loadingData ? 'Loading user activity…' : 'No usage leaders to show yet.'} />}
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#f0f2f8] pt-4">
            <MiniMetric label="Input tokens" value={metrics.inputTokens ?? metrics.tokens?.inputTokens ?? 0} loading={loadingData} hasData={Boolean(dashboard)} />
            <MiniMetric label="Output tokens" value={metrics.outputTokens ?? metrics.tokens?.outputTokens ?? 0} loading={loadingData} hasData={Boolean(dashboard)} />
          </div>
        </section>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <section className="rounded-2xl border border-[#e8eaf6] bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-[#1a1a2e]">New registrations</h2>
          <p className="mt-1 text-xs text-[#8b93ad]">Accounts created within the selected range</p>
          {registrationRows.length ? <MiniBarChart rows={registrationRows} /> : <EmptyState text={loadingData ? 'Loading registrations…' : 'No registrations in this range.'} />}
        </section>
        <section className="rounded-2xl border border-[#e8eaf6] bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-[#1a1a2e]">Models by usage</h2>
          {modelRows.length ? <div className="mt-3 space-y-3">{modelRows.slice(0, 6).map((item, index) => <div key={item.model || item._id || index} className="flex items-center justify-between gap-3 text-sm"><span className="truncate text-[#566078]">{item.model || item.name || item._id || 'Model'}</span><span className="font-semibold text-[#5c6bc0]">{Number(item.count ?? item.prompts ?? item.total ?? 0).toLocaleString()}</span></div>)}</div> : <EmptyState text={loadingData ? 'Loading model usage…' : 'No model usage in this range.'} />}
        </section>
        <section className="rounded-2xl border border-[#e8eaf6] bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-[#1a1a2e]">Request outcomes</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <MiniMetric label="Successful" value={errorSummary.successfulRequests ?? errorSummary.success ?? errorSummary.succeeded ?? metrics.successfulRequests ?? 0} loading={loadingData} hasData={Boolean(dashboard)} />
            <MiniMetric label="Failed" value={errorSummary.failedRequests ?? errorSummary.failed ?? metrics.failedRequests ?? 0} loading={loadingData} hasData={Boolean(dashboard)} />
            <MiniMetric label="Input tokens" value={analytics.tokens?.inputTokens ?? analytics.tokens?.totals?.inputTokens ?? metrics.inputTokens ?? 0} loading={loadingData} hasData={Boolean(dashboard)} />
            <MiniMetric label="Output tokens" value={analytics.tokens?.outputTokens ?? analytics.tokens?.totals?.outputTokens ?? metrics.outputTokens ?? 0} loading={loadingData} hasData={Boolean(dashboard)} />
          </div>
          {errorSummary.errors?.length > 0 && <div className="mt-3 border-t border-[#f0f2f8] pt-3">{errorSummary.errors.slice(0, 3).map((item, index) => <p key={item.code || index} className="py-1 text-xs text-[#7b849a]">{item.code || item.errorCode || 'Error'} · {item.count ?? 0}</p>)}</div>}
        </section>
      </div>
    </section>
    </main>
  )
}

function Metric({ title, value }) {
  return <div className="rounded-xl border border-[#e8eaf6] bg-[#fcfcff] p-3"><p className="text-[10px] font-medium text-[#8b93ad]">{title}</p><p className="mt-1 text-lg font-bold text-[#272b4a]">{typeof value === 'number' ? value.toLocaleString() : value}</p></div>
}

function MiniMetric({ label, value, loading, hasData }) {
  const displayValue = loading ? 'Loading…' : hasData ? Number(value ?? 0).toLocaleString() : '—'
  return <div><p className="text-[10px] text-[#8b93ad]">{label}</p><p className="mt-1 text-sm font-semibold text-[#394055]">{displayValue}</p></div>
}

function EmptyState({ text }) {
  return <p className="py-8 text-center text-sm text-[#8b93ad]">{text}</p>
}

function extractRows(value) {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== 'object') return []
  for (const key of ['series', 'daily', 'items', 'results', 'data', 'registrations', 'models']) {
    if (Array.isArray(value[key])) return value[key]
  }
  return []
}

function MiniBarChart({ rows }) {
  const values = rows.map((row) => Number(row.count ?? row.prompts ?? row.users ?? row.total ?? 0))
  const maximum = Math.max(1, ...values)
  return <div className="mt-4 flex h-32 items-end gap-1.5 border-b border-[#edf0f8] pb-1">
    {rows.slice(-14).map((row, index) => {
      const count = Number(row.count ?? row.prompts ?? row.users ?? row.total ?? 0)
      return <div key={row.date || row._id || index} className="flex h-full min-w-0 flex-1 flex-col justify-end" title={`${row.date || row._id || ''}: ${count}`}>
        <div className="mx-auto w-full max-w-7 rounded-t bg-gradient-to-t from-[#764ba2] to-[#667eea]" style={{ height: `${Math.max(3, count / maximum * 80)}%` }} />
        <span className="mt-1 truncate text-center text-[8px] text-[#8b93ad]">{formatTick(row.date || row._id)}</span>
      </div>
    })}
  </div>
}

function formatTick(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { timeZone: 'UTC' })
}

export default AdminDashboardPage
