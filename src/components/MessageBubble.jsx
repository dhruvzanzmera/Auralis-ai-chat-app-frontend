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
    <article className={`msg-enter mb-6 flex min-w-0 gap-2.5 sm:gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Assistant avatar */}
      {!isUser && (
        <div
          className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white"
          style={{
            background: 'linear-gradient(135deg, #6874df, #7655a8)',
          }}
        >
          A
        </div>
      )}

      <div className={`min-w-0 max-w-[calc(100%_-_2.75rem)] sm:max-w-[82%] ${isUser ? '' : 'flex-1'}`}>
        {isUser ? (
          <div className="flex flex-col items-end gap-1.5">
            {editing ? (
              <form
                onSubmit={submitEdit}
                className="w-[min(32rem,calc(100vw-5rem))] rounded-2xl border border-[#e0e3f7] bg-white p-3 shadow-md sm:w-[min(32rem,80vw)]"
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
                    aria-busy={saving}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#5c6bc0] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#4b5ab0] disabled:opacity-50"
                  >
                    {saving && <span aria-hidden="true" className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
                    {saving ? 'Updating…' : 'Update'}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div
                  className="inline-block max-w-full rounded-3xl rounded-tr-lg px-4 py-3"
                  style={{
                    background: '#565db9',
                  }}
                >
                  <p className="break-words [overflow-wrap:anywhere] whitespace-pre-wrap text-[15px] leading-[1.7] text-white">{message.content}</p>
                </div>
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => { setDraft(message.content); setEditing(true) }}
                    disabled={disabled}
                    aria-label="Edit prompt"
                    title="Edit prompt"
                    className="min-h-10 min-w-10 rounded-lg p-2 text-[#68718b] transition hover:bg-[#eff0ff] hover:text-[#424aa6] disabled:opacity-50"
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
            className="rounded-2xl rounded-tl-md px-4 py-3.5 sm:px-5 sm:py-4"
            style={{
              background: '#ffffff',
              border: '1px solid #e4e7f1',
              boxShadow: '0 1px 3px rgba(34,43,90,0.04)',
            }}
          >
            <div className="markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            </div>
            {/* Copy button */}
            <div className="mt-3 flex items-center gap-2 border-t border-[#edf0f6] pt-2.5">
              <button
                type="button"
                onClick={copyMessage}
                className="flex min-h-10 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#68718b] transition hover:bg-[#f2f4fb] hover:text-[#424aa6]"
                style={{
                  color: copied ? '#424aa6' : undefined,
                  background: copied ? '#eff0ff' : undefined,
                }}
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
                {!copied && 'Copy'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div
          className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-semibold text-white"
          style={{ background: '#727b96' }}
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
