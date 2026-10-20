import { useRef, useState } from 'react'

function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  const resize = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
  }

  const submit = () => {
    const prompt = value.trim()
    if (!prompt || disabled) return
    onSend(prompt)
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const onKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  const canSend = value.trim().length > 0 && !disabled

  return (
    <div
      className="shrink-0 px-4 pb-5 pt-3"
      style={{
        background: 'rgba(248,249,252,0.9)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid #e8eaf6',
      }}
    >
      <div className="mx-auto max-w-3xl">
        {/* Input box */}
        <div
          className="composer-shell flex items-end gap-3 rounded-2xl px-4 py-3 transition-all duration-200"
          style={{
            background: '#ffffff',
            border: '1.5px solid #e0e3f7',
            boxShadow: '0 4px 16px rgba(92,107,192,0.1)',
          }}
        >
          <textarea
            ref={textareaRef}
            id="chat-input"
            rows="1"
            value={value}
            disabled={disabled}
            onChange={(event) => { setValue(event.target.value); resize() }}
            onKeyDown={onKeyDown}
            placeholder="Ask Zenith anything…"
            aria-label="Message"
            className="max-h-[200px] min-h-7 flex-1 resize-none bg-transparent py-1 text-[14.5px] leading-6 outline-none disabled:opacity-60"
            style={{ color: '#1a1a2e' }}
          />
          <button
            id="send-btn"
            onClick={submit}
            disabled={!canSend}
            aria-label="Send message"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200"
            style={{
              background: canSend
                ? 'linear-gradient(135deg, #667eea, #764ba2)'
                : '#f0f2ff',
              boxShadow: canSend ? '0 4px 12px rgba(102,126,234,0.4)' : 'none',
              color: canSend ? '#ffffff' : '#c5cae9',
              cursor: canSend ? 'pointer' : 'not-allowed',
              transform: canSend ? 'scale(1)' : 'scale(0.95)',
            }}
          >
            {disabled
              ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              : <SendIcon />
            }
          </button>
        </div>

        {/* Disclaimer */}
        <p className="mt-2 text-center text-[10.5px]" style={{ color: '#8b93ad' }}>
          Enter to send · Shift + Enter for a new line · Verify important information.
        </p>
      </div>
    </div>
  )
}

function SendIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M12 19V5m-7 7 7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default ChatInput
