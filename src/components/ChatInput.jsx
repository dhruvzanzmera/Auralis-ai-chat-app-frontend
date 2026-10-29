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
      className="shrink-0 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pb-5"
      style={{
        background: 'rgba(247,248,252,0.94)',
        backdropFilter: 'blur(14px)',
        borderTop: '1px solid #e4e7f1',
      }}
    >
      <div className="mx-auto w-full max-w-3xl">
        {/* Input box */}
        <div
          className="composer-shell flex items-end gap-2 rounded-2xl px-3 py-2.5 transition-all duration-200 sm:gap-3 sm:px-4"
          style={{
            background: '#ffffff',
            border: '1px solid #dfe3ef',
            boxShadow: '0 3px 12px rgba(34,43,90,0.06)',
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
            placeholder="Ask Auralis anything…"
            aria-label="Message"
            aria-describedby="chat-input-hint"
            className="max-h-[200px] min-h-10 flex-1 resize-none bg-transparent py-2 text-base leading-6 outline-none disabled:opacity-60 sm:text-[15px]"
            style={{ color: '#1a1a2e' }}
          />
          <button
            id="send-btn"
            onClick={submit}
            disabled={!canSend}
            aria-label="Send message"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200 hover:brightness-105"
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
        <p id="chat-input-hint" className="mt-2 hidden text-center text-xs sm:block" style={{ color: '#727b96' }}>
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
