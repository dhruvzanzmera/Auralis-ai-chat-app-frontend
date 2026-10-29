import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import Loader from './Loader'

const suggestions = [
  { icon: '💡', title: 'Explore an idea', detail: 'Help me think through a new project idea' },
  { icon: '📖', title: 'Learn something', detail: 'Explain a complex topic simply' },
  { icon: '✍️', title: 'Write something', detail: 'Help me write a professional email' },
  { icon: '🧠', title: 'Solve a problem', detail: 'Debug my code or work through a hard problem' },
]

function ChatWindow({ messages, loading, error, onSuggestion, onEditMessage, regeneratingIndex }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    bottomRef.current?.scrollIntoView({ behavior, block: 'end' })
  }, [messages, loading])

  return (
    <section className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      {messages.length === 0 ? (
        <div className="mx-auto flex min-h-full max-w-3xl flex-col justify-center px-5 pb-10 pt-8 sm:px-6 sm:pb-12">
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
            <span className="rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em]" style={{ background: '#eff0ff', color: '#535bb4' }}>
              Your AI workspace
            </span>
          </div>
          <h1
            className="mt-4 text-[clamp(1.75rem,4vw,2.4rem)] font-bold leading-tight"
            style={{ color: '#1a1a2e', letterSpacing: '-0.02em' }}
          >
            Hello! I&apos;m <span style={{ color: '#5b62c7' }}>Auralis</span>
          </h1>
          <p className="mt-2 max-w-lg text-[15px] leading-7" style={{ color: '#626b86' }}>
            Your intelligent AI assistant — built to help you think, create, and make the most of every idea.
          </p>

          {/* Suggestion cards */}
          <div className="mt-7 grid gap-3 sm:mt-9 sm:grid-cols-2">
            {suggestions.map((s) => (
              <button
                key={s.title}
                type="button"
                onClick={() => onSuggestion(s.detail)}
                className="suggestion-card group flex items-start gap-3 rounded-2xl p-4 text-left transition-all duration-200 sm:p-5"
                aria-label={`${s.title}: ${s.detail}`}
                style={{
                  background: '#ffffff',
                }}
              >
                <span aria-hidden="true" className="mt-0.5 text-xl">{s.icon}</span>
                <div>
                  <p className="text-sm font-bold" style={{ color: '#24283f' }}>{s.title}</p>
                  <p className="mt-1 text-[13px] leading-5" style={{ color: '#68718b' }}>{s.detail}</p>
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
        <div className="mx-auto max-w-3xl px-4 pb-8 pt-6 sm:px-6">
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
