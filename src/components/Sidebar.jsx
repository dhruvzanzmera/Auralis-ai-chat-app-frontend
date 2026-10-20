function Sidebar({ chats, activeChatId, open, onNewChat, onSelectChat, onDeleteChat }) {
  return (
    <aside
      style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f5f6ff 100%)',
        borderRight: '1px solid #e8eaf6',
        boxShadow: open ? '4px 0 24px rgba(92,107,192,0.12)' : 'none',
      }}
      className={`fixed inset-y-0 left-0 z-30 flex w-[270px] shrink-0 flex-col p-3 transition-transform duration-300 md:relative md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'
        }`}
    >
      {/* Brand */}
      <div className="flex items-center justify-between px-2 pb-5 pt-3">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-white"
            style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              boxShadow: '0 4px 12px rgba(102,126,234,0.35)',
            }}
          >
            Z
          </div>
          <div>
            <p className="text-sm font-bold leading-tight" style={{ color: '#1a1a2e' }}>Zenith</p>
            <p className="text-[10px] leading-tight" style={{ color: '#9fa8da' }}>AI Assistant</p>
          </div>
        </div>
      </div>

      {/* New Chat Button */}
      <button
        id="new-chat-btn"
        onClick={onNewChat}
        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-150"
        style={{
          background: 'linear-gradient(135deg, #667eea18, #764ba212)',
          border: '1px solid #e0e3f7',
          color: '#3949ab',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #667eea28, #764ba220)'
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(102,126,234,0.18)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #667eea18, #764ba212)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        <div
          className="flex h-6 w-6 items-center justify-center rounded-lg"
          style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
        >
          <PlusIcon />
        </div>
        <span>New conversation</span>
      </button>

      {/* Chat History */}
      <div className="mt-6 flex-1 overflow-y-auto">
        <p
          className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.15em]"
          style={{ color: '#b0bcd8' }}
        >
          Recent
        </p>
        <div className="space-y-0.5">
          {chats.map((chat) => (
            <div
              key={chat._id}
              className="group flex items-center gap-1 rounded-xl px-2 py-1.5 transition-all duration-150"
              style={{
                background: activeChatId === chat._id
                  ? 'linear-gradient(135deg, #667eea18, #764ba212)'
                  : 'transparent',
                border: activeChatId === chat._id ? '1px solid #e0e3f7' : '1px solid transparent',
              }}
              onMouseEnter={e => {
                if (activeChatId !== chat._id) e.currentTarget.style.background = '#f0f2ff'
              }}
              onMouseLeave={e => {
                if (activeChatId !== chat._id) e.currentTarget.style.background = 'transparent'
              }}
            >
              <button
                title={chat.title}
                onClick={() => onSelectChat(chat._id)}
                className="min-w-0 flex-1 truncate py-1.5 text-left text-[13px] font-medium"
                style={{ color: activeChatId === chat._id ? '#3949ab' : '#4a5580' }}
              >
                {chat.title || 'New conversation'}
              </button>
              <button
                aria-label={`Delete ${chat.title || 'conversation'}`}
                title="Delete chat"
                onClick={() => onDeleteChat(chat._id)}
                className="rounded-lg p-1.5 opacity-0 transition-all group-hover:opacity-100 focus:opacity-100"
                style={{ color: '#b0bcd8' }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#fce8e8'
                  e.currentTarget.style.color = '#e53935'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#b0bcd8'
                }}
              >
                <TrashIcon />
              </button>
            </div>
          ))}
          {chats.length === 0 && (
            <p className="px-2 py-4 text-center text-xs" style={{ color: '#b0bcd8' }}>
              Your conversations will appear here.
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        className="mt-3 px-3 pt-4 text-[11px]"
        style={{ borderTop: '1px solid #e8eaf6', color: '#b0bcd8' }}
      >
        Made for curious minds ✦
      </div>
    </aside>
  )
}

function PlusIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default Sidebar
