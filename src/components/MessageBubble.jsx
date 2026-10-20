import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

function MessageBubble({ message }) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'

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
      {/* Zenith avatar */}
      {!isUser && (
        <div
          className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white"
          style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            boxShadow: '0 3px 10px rgba(102,126,234,0.35)',
          }}
        >
          Z
        </div>
      )}

      <div className={`min-w-0 max-w-[88%] sm:max-w-[80%] ${isUser ? '' : 'flex-1'}`}>
        {isUser ? (
          /* User bubble */
          <div
            className="inline-block rounded-3xl rounded-tr-lg px-4 py-3"
            style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              boxShadow: '0 4px 14px rgba(102,126,234,0.3)',
            }}
          >
            <p className="whitespace-pre-wrap text-[14.5px] leading-[1.65] text-white">{message.content}</p>
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
            <div className="markdown-content text-[14.5px]">
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

export default MessageBubble
