import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

function MessageBubble({ message, messageIndex, onEdit, disabled }) {
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(message.content)
  const [saving, setSaving] = useState(false)
  const isUser = message.role === 'user'

  const submitEdit = async (event) => {
    event.preventDefault()
    const prompt = draft.trim()
    if (!prompt || saving || disabled) return
    setSaving(true)
    const updated = await onEdit(messageIndex, prompt)
    setSaving(false)
    if (updated) setEditing(false)
  }

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <article className={`msg-enter mb-6 flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Assistant avatar */}
      {!isUser && (
        <div
          className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white"
          style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            boxShadow: '0 3px 10px rgba(102,126,234,0.35)',
          }}
        >
          A
        </div>
      )}

      <div className={`min-w-0 max-w-[88%] sm:max-w-[80%] ${isUser ? '' : 'flex-1'}`}>
        {isUser ? (
          <div className="flex flex-col items-end gap-1.5">
            {editing ? (
              <form
                onSubmit={submitEdit}
                className="w-[min(32rem,80vw)] rounded-2xl border border-[#e0e3f7] bg-white p-3 shadow-md"
              >
                <textarea
                  aria-label="Edit your prompt"
                  autoFocus
                  rows={Math.min(6, Math.max(2, draft.split('\n').length))}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  disabled={saving}
                  className="w-full resize-y rounded-lg border border-[#e8eaf6] bg-[#fafbff] p-3 text-sm leading-6 text-[#1a1a2e] outline-none focus:border-[#9fa8da]"
                />
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => { setDraft(message.content); setEditing(false) }}
                    disabled={saving}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-[#5c6bc0] hover:bg-[#f0f2ff] disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!draft.trim() || saving || disabled}
                    className="rounded-lg bg-[#5c6bc0] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#4b5ab0] disabled:opacity-50"
                  >
                    {saving ? 'Updating…' : 'Update'}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div
                  className="inline-block rounded-3xl rounded-tr-lg px-4 py-3"
                  style={{
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    boxShadow: '0 4px 14px rgba(102,126,234,0.3)',
                  }}
                >
                  <p className="whitespace-pre-wrap text-sm leading-[1.65] text-white">{message.content}</p>
                </div>
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => { setDraft(message.content); setEditing(true) }}
                    disabled={disabled}
                    aria-label="Edit prompt"
                    title="Edit prompt"
                    className="rounded-md p-1.5 text-[#8b93ad] transition hover:bg-[#eef0fb] hover:text-[#5c6bc0] disabled:opacity-50"
                  >
                    <EditIcon />
                  </button>
                )}
              </>
            )}
          </div>
        ) : (
          /* AI response */
          <div
            className="rounded-3xl rounded-tl-lg px-5 py-4"
            style={{
              background: '#ffffff',
              border: '1px solid #e8eaf6',
              boxShadow: '0 2px 12px rgba(92,107,192,0.08)',
            }}
          >
            <div className="markdown-content text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            </div>
            {/* Copy button */}
            <div className="mt-3 flex items-center gap-2" style={{ borderTop: '1px solid #f0f2ff', paddingTop: '10px' }}>
              <button
                onClick={copyMessage}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-150"
                style={{
                  color: copied ? '#3949ab' : '#9fa8da',
                  background: copied ? '#eef0fb' : 'transparent',
                  border: copied ? '1px solid #e0e3f7' : '1px solid transparent',
                }}
                onMouseEnter={e => {
                  if (!copied) {
                    e.currentTarget.style.background = '#f5f6ff'
                    e.currentTarget.style.color = '#5c6bc0'
                    e.currentTarget.style.border = '1px solid #e8eaf6'
                  }
                }}
                onMouseLeave={e => {
                  if (!copied) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#9fa8da'
                    e.currentTarget.style.border = '1px solid transparent'
                  }
                }}
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div
          className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #f093fb, #f5576c)' }}
        >
          U
        </div>
      )}
    </article>
  )
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m14 5 5 5M4 20l4.2-.9L19 8.3a2.1 2.1 0 0 0-3-3L5.2 16.1 4 20Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default MessageBubble
