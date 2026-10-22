function Loader() {
  return (
    <div className="msg-enter mb-6 flex items-start gap-3" aria-label="Auralis is thinking" role="status">
      {/* Auralis avatar */}
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white"
        style={{
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          boxShadow: '0 3px 10px rgba(102,126,234,0.35)',
        }}
      >
        A
      </div>

      {/* Typing indicator */}
      <div
        className="flex items-center gap-1.5 rounded-3xl rounded-tl-lg px-5 py-4"
        style={{
          background: '#ffffff',
          border: '1px solid #e8eaf6',
          boxShadow: '0 2px 12px rgba(92,107,192,0.08)',
        }}
      >
        <span
          className="h-2 w-2 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            animation: 'bounce 1.2s infinite',
            animationDelay: '0s',
          }}
        />
        <span
          className="h-2 w-2 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            animation: 'bounce 1.2s infinite',
            animationDelay: '0.2s',
          }}
        />
        <span
          className="h-2 w-2 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            animation: 'bounce 1.2s infinite',
            animationDelay: '0.4s',
          }}
        />
      </div>
    </div>
  )
}

export default Loader
