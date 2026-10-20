import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import Loader from './Loader'

const suggestions = [
  { icon: '💡', title: 'Explore an idea', detail: 'Help me think through a new project idea' },
  { icon: '📖', title: 'Learn something', detail: 'Explain a complex topic simply' },
  { icon: '✍️', title: 'Write something', detail: 'Help me write a professional email' },
  { icon: '🧠', title: 'Solve a problem', detail: 'Debug my code or work through a hard problem' },
]

function ChatWindow({ messages, loading, error, onSuggestion }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading])

  return (
    <section className="min-h-0 flex-1 overflow-y-auto">
      {messages.length === 0 ? (
        <div className="mx-auto flex min-h-full max-w-3xl flex-col justify-center px-5 pb-12 pt-10">
          {/* Welcome hero */}
          <div className="mb-2 flex items-center gap-3">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-bold text-white"
              style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                boxShadow: '0 8px 24px rgba(102,126,234,0.35)',
              }}
            >
              Z
            </div>
            <span className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ background: '#eef0fb', color: '#5c6bc0' }}>
              Your AI workspace
            </span>
          </div>
          <h1
            className="mt-4 text-3xl font-bold leading-tight sm:text-4xl"
            style={{ color: '#1a1a2e', letterSpacing: '-0.02em' }}
          >
            Hello! I&apos;m <span style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Zenith</span>
          </h1>
          <p className="mt-2 max-w-md text-base leading-7" style={{ color: '#7986a8' }}>
            Your intelligent AI assistant — built to help you think, create, and reach the peak of what&apos;s possible.
          </p>

          {/* Suggestion cards */}
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {suggestions.map((s) => (
              <button
                key={s.title}
                onClick={() => onSuggestion(s.detail)}
                className="suggestion-card group flex items-start gap-3 rounded-2xl p-4 text-left transition-all duration-200"
                style={{
                  background: '#ffffff',
                  border: '1px solid #e8eaf6',
                  boxShadow: '0 2px 8px rgba(92,107,192,0.06)',
                }}
              >
                <span className="mt-0.5 text-xl">{s.icon}</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#1a1a2e' }}>{s.title}</p>
                  <p className="mt-0.5 text-xs leading-5" style={{ color: '#7986a8' }}>{s.detail}</p>
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
            <MessageBubble key={`${message.createdAt || index}-${index}`} message={message} />
          ))}
          {loading && <Loader />}
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
