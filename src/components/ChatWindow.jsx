import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import Loader from './Loader'

const suggestions = [
  { icon: '💡', title: 'Explore an idea', detail: 'Help me think through a new project idea' },
  { icon: '📖', title: 'Learn something', detail: 'Explain a complex topic simply' },
  { icon: '✍️', title: 'Write something', detail: 'Help me write a professional email' },
  { icon: '🧠', title: 'Solve a problem', detail: 'Debug my code or work through a hard problem' },
]

function ChatWindow({ messages, loading, loadingChat, error, onSuggestion, onEditMessage, regeneratingIndex }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    bottomRef.current?.scrollIntoView({ behavior, block: 'end' })
  }, [messages, loading, loadingChat])

  return (
    <section className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      {loadingChat ? (
        <div className="flex min-h-full flex-col items-center justify-center gap-4 px-5 text-center" role="status" aria-live="polite">
          <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#e0e3f7] border-t-[#667eea]" />
          <div>
              <p className="text-sm font-semibold text-[var(--color-text)]">Opening conversation</p>
              <p className="chat-muted mt-1 text-xs">Your messages will be here in a moment.</p>
          </div>
        </div>
      ) : messages.length === 0 ? (
        <div className="mx-auto flex min-h-full max-w-3xl flex-col justify-center px-5 pb-7 pt-6 sm:px-6 sm:pb-9">
          {/* Welcome hero */}
          <div className="mb-2 flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-bold text-white sm:h-14 sm:w-14 sm:text-2xl"
              style={{
                background: 'linear-gradient(135deg, #6874df, #7655a8)',
                boxShadow: '0 8px 20px rgba(91,98,199,0.22)',
              }}
            >
              A
            </div>
            <span className="chat-welcome-badge rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em]">
              Your AI workspace
            </span>
          </div>
          <h1
            className="chat-welcome-title mt-3 text-[clamp(1.65rem,3.5vw,2.1rem)] font-bold leading-tight tracking-tight"
          >
            Hello! I&apos;m <span style={{ color: '#5b62c7' }}>Auralis</span>
          </h1>
          <p className="chat-welcome-copy mt-2 max-w-lg text-sm leading-6">
            Your intelligent AI assistant — built to help you think, create, and make the most of every idea.
          </p>

          {/* Suggestion cards */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {suggestions.map((s) => (
              <button
                key={s.title}
                type="button"
                onClick={() => onSuggestion(s.detail)}
                className="chat-suggestion-card suggestion-card group flex items-start gap-3 rounded-2xl p-4 text-left transition-all duration-200"
                aria-label={`${s.title}: ${s.detail}`}
              >
                <span aria-hidden="true" className="mt-0.5 text-xl">{s.icon}</span>
                <div>
                  <p className="chat-suggestion-title text-sm font-bold">{s.title}</p>
                  <p className="chat-suggestion-copy mt-1 text-[13px] leading-5">{s.detail}</p>
                </div>
              </button>
            ))}
          </div>

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-xl px-4 py-3 text-sm"
              style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}
            >
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="mx-auto max-w-6xl px-4 pb-8 pt-6 sm:px-6">
          {messages.map((message, index) => (
            <div key={`${message.createdAt || index}-${index}`}>
              <MessageBubble
                message={message}
                messageIndex={index}
                onEdit={onEditMessage}
                disabled={loading}
              />
              {regeneratingIndex === index && loading && <Loader />}
            </div>
          ))}
          {loading && regeneratingIndex === null && <Loader />}
          {error && (
            <div
              role="alert"
              className="my-4 rounded-xl px-4 py-3 text-sm"
              style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}
            >
              {error}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}
    </section>
  )
}

export default ChatWindow
