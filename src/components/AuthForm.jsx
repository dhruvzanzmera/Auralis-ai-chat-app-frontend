import { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { chatApi, getApiMessage } from '../api/chatApi'
import { useAuth } from '../auth/useAuth'
import PasswordInput from './PasswordInput'

const copy = {
  login: {
    title: 'Welcome back',
    description: 'Sign in to continue to your conversations.',
    submit: 'Sign in',
  },
  register: {
    title: 'Create your account',
    description: 'Create an account to keep your conversations private and synced.',
    submit: 'Create account',
  },
  admin: {
    title: 'Administrator sign in',
    description: 'Admin access is limited to authorized Auralis administrators.',
    submit: 'Sign in as administrator',
  },
  forgot: {
    title: 'Reset your password',
    description: 'Enter your account email and we’ll send reset instructions if it exists.',
    submit: 'Send reset instructions',
  },
  reset: {
    title: 'Choose a new password',
    description: 'Your reset link is time-limited. Choose a strong password.',
    submit: 'Update password',
  },
}

function AuthForm({ mode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { signIn, register } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', newPassword: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState(location.state?.notice || '')
  const resetToken = searchParams.get('token') || ''

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')
    setBusy(true)
    try {
      if (mode === 'forgot') {
        const { data } = await chatApi.post('/auth/forgot-password', { email: form.email })
        setNotice(data.message)
      } else if (mode === 'reset') {
        const { data } = await chatApi.post('/auth/reset-password', {
          token: resetToken,
          password: form.newPassword,
        })
        navigate('/login', { replace: true, state: { notice: data.message } })
      } else {
        if (mode === 'register') {
          await register({ name: form.name, email: form.email, password: form.password })
        } else {
          await signIn({ email: form.email, password: form.password }, mode === 'admin')
        }
        navigate(mode === 'admin' ? '/admin' : '/chat', { replace: true })
      }
    } catch (requestError) {
      setError(getApiMessage(requestError))
    } finally {
      setBusy(false)
    }
  }

  const isPasswordFlow = ['login', 'admin', 'register'].includes(mode)
  const heading = copy[mode]

  return (
    <main className="auth-backdrop flex min-h-dvh items-center justify-center px-4 py-10">
      <section className="auth-card w-full max-w-md rounded-3xl border bg-white p-7 sm:p-9">
        <div className="mb-7">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#667eea] to-[#764ba2] text-lg font-bold text-white">A</div>
          <div><p className="font-bold text-[#1a1a2e]">Auralis</p><p className="text-xs text-[#8b93ad]">Your AI workspace</p></div>
        </Link>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1a1a2e]">{heading.title}</h1>
        <p className="mt-2 text-sm leading-6 text-[#7986a8]">{heading.description}</p>

        <form className="mt-7 space-y-4" onSubmit={submit}>
          {mode === 'register' && <Field label="Name" name="name" value={form.name} onChange={update} autoComplete="name" required maxLength={80} />}
          {mode !== 'reset' && <Field label="Email" name="email" value={form.email} onChange={update} type="email" autoComplete="email" required />}
          {isPasswordFlow && <Field label="Password" name="password" value={form.password} onChange={update} type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} required minLength={10} maxLength={128} />}
          {mode === 'reset' && <Field label="New password" name="newPassword" value={form.newPassword} onChange={update} type="password" autoComplete="new-password" required minLength={10} maxLength={128} />}
          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p>}
          {notice && <p role="status" className="rounded-xl border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-800">{notice}</p>}
          <button disabled={busy} aria-busy={busy} className="btn-primary flex w-full items-center justify-center gap-2 px-4 py-3 text-sm transition disabled:cursor-wait disabled:opacity-60">
            {busy && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
            {busy ? 'Please wait…' : heading.submit}
          </button>
        </form>

        <div className="mt-6 flex flex-wrap justify-between gap-x-4 gap-y-2 text-sm">
          {mode === 'login' && <>
            <Link className="text-[#5c6bc0] hover:underline" to="/forgot-password">Forgot password?</Link>
            <Link className="text-[#5c6bc0] hover:underline" to="/register">Create account</Link>
            <Link className="w-full text-left text-xs text-[#8b93ad] hover:text-[#5c6bc0]" to="/admin/login">Administrator sign in</Link>
          </>}
          {mode === 'admin' && <Link className="text-[#5c6bc0] hover:underline" to="/login">Back to user sign in</Link>}
          {(mode === 'register' || mode === 'forgot' || mode === 'reset') && <Link className="text-[#5c6bc0] hover:underline" to="/login">Back to sign in</Link>}
        </div>
        <p className="mt-7 border-t border-[#eef0f8] pt-4 text-center text-[11px] text-[#9aa2b8]">Your account credentials are protected with secure authentication.</p>
      </section>
    </main>
  )
}

function Field({ label, name, value, onChange, type = 'text', ...props }) {
  return (
    <label className="block text-sm font-medium text-[#394055]">
      {label}
      {type === 'password' ? (
        <PasswordInput
          className="form-control mt-1.5 w-full pl-3.5 py-2.5 text-sm outline-none"
          name={name}
          value={value}
          onChange={onChange}
          {...props}
        />
      ) : (
        <input
          className="form-control mt-1.5 w-full px-3.5 py-2.5 text-sm outline-none"
          name={name}
          value={value}
          onChange={onChange}
          type={type}
          {...props}
        />
      )}
    </label>
  )
}

export default AuthForm
