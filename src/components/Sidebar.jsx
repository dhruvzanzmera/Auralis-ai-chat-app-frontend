import { useEffect, useRef, useState } from 'react'

function Sidebar({ chats, loadingChats, activeChatId, open, onNewChat, onSelectChat, onDeleteChat, onRenameChat }) {
  const [editingChatId, setEditingChatId] = useState(null)
  const [draftTitle, setDraftTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const titleInputRef = useRef(null)
  const cancelDeleteRef = useRef(null)
  const deletingRef = useRef(false)

  useEffect(() => {
    if (editingChatId) titleInputRef.current?.focus()
  }, [editingChatId])

  useEffect(() => {
    if (!deleteTarget) return undefined
    cancelDeleteRef.current?.focus()
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !deletingRef.current) setDeleteTarget(null)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [deleteTarget])

  const startRename = (chat) => {
    setEditingChatId(chat._id)
    setDraftTitle(chat.title || '')
  }

  const cancelRename = () => {
    setEditingChatId(null)
    setDraftTitle('')
  }

  const submitRename = async (event, chatId) => {
    event.preventDefault()
    const title = draftTitle.trim()
    if (!title || title.length > 80 || saving) return

    setSaving(true)
    const renamed = await onRenameChat(chatId, title)
    setSaving(false)
    if (renamed) cancelRename()
  }

  const confirmDelete = async () => {
    if (!deleteTarget || deleting) return
    deletingRef.current = true
    setDeleting(true)
    const deleted = await onDeleteChat(deleteTarget._id)
    deletingRef.current = false
    setDeleting(false)
    if (deleted) setDeleteTarget(null)
  }

  return (
    <>
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
            A
          </div>
          <div>
            <p className="text-sm font-bold leading-tight" style={{ color: '#1a1a2e' }}>Auralis</p>
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
              {editingChatId === chat._id ? (
                <form onSubmit={(event) => submitRename(event, chat._id)} className="flex min-w-0 flex-1 items-center gap-1">
                  <input
                    ref={titleInputRef}
                    aria-label="Conversation title"
                    maxLength={80}
                    value={draftTitle}
                    onChange={(event) => setDraftTitle(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') cancelRename()
                    }}
                    className="min-w-0 flex-1 rounded-md border border-[#c5cae9] bg-white px-2 py-1 text-xs outline-none"
                  />
                  <button
                    aria-label="Save conversation title"
                    title="Save"
                    type="submit"
                    disabled={!draftTitle.trim() || saving}
                    className="rounded-lg p-1.5 text-[#5c6bc0] hover:bg-[#eef0fb] disabled:opacity-50"
                  >
                    <CheckIcon />
                  </button>
                  <button
                    aria-label="Cancel rename"
                    title="Cancel"
                    type="button"
                    onClick={cancelRename}
                    className="rounded-lg p-1.5 text-[#8b93ad] hover:bg-[#eef0fb]"
                  >
                    <CloseIcon />
                  </button>
                </form>
              ) : (
                <>
                  <button
                    title={chat.title}
                    onClick={() => onSelectChat(chat._id)}
                    className="min-w-0 flex-1 truncate py-1.5 text-left text-xs font-medium"
                    style={{ color: activeChatId === chat._id ? '#3949ab' : '#4a5580' }}
                  >
                    {chat.title || 'New conversation'}
                  </button>
                  <button
                    aria-label={`Rename ${chat.title || 'conversation'}`}
                    title="Rename chat"
                    onClick={() => startRename(chat)}
                    className="rounded-lg p-1.5 text-[#b0bcd8] opacity-100 transition-all hover:bg-[#eef0fb] hover:text-[#5c6bc0] md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100"
                  >
                    <EditIcon />
                  </button>
                  <button
                    aria-label={`Delete ${chat.title || 'conversation'}`}
                    title="Delete chat"
                    onClick={() => setDeleteTarget(chat)}
                    className="rounded-lg p-1.5 text-[#b0bcd8] opacity-100 transition-all hover:bg-[#fce8e8] hover:text-[#e53935] md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100"
                  >
                    <TrashIcon />
                  </button>
                </>
              )}
            </div>
          ))}
          {loadingChats && (
            <p role="status" className="px-2 py-4 text-center text-xs" style={{ color: '#b0bcd8' }}>
              Loading conversations…
            </p>
          )}
          {!loadingChats && chats.length === 0 && (
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
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#1a1a2e]/40 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting) setDeleteTarget(null)
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-chat-title"
            aria-describedby="delete-chat-description"
            onKeyDown={(event) => {
              if (event.key !== 'Tab') return
              const buttons = event.currentTarget.querySelectorAll('button:not(:disabled)')
              const firstButton = buttons[0]
              const lastButton = buttons[buttons.length - 1]
              if (event.shiftKey && document.activeElement === firstButton) {
                event.preventDefault()
                lastButton?.focus()
              } else if (!event.shiftKey && document.activeElement === lastButton) {
                event.preventDefault()
                firstButton?.focus()
              }
            }}
            className="w-full max-w-sm rounded-2xl border border-[#e8eaf6] bg-white p-5 shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fce8e8] text-[#d32f2f]">
                <TrashIcon />
              </div>
              <div>
                <h2 id="delete-chat-title" className="text-base font-semibold text-[#1a1a2e]">Delete conversation?</h2>
                <p id="delete-chat-description" className="mt-1 text-sm leading-5 text-[#68718b]">
                  “{deleteTarget.title || 'New conversation'}” and its messages will be permanently deleted.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                ref={cancelDeleteRef}
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="rounded-lg border border-[#e0e3f7] px-3.5 py-2 text-sm font-medium text-[#4a5580] transition hover:bg-[#f5f6ff] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="rounded-lg bg-[#d32f2f] px-3.5 py-2 text-sm font-medium text-white transition hover:bg-[#b71c1c] disabled:cursor-wait disabled:opacity-60"
              >
                {deleting ? 'Deleting…' : 'Delete conversation'}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
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

function EditIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m14 5 5 5M4 20l4.2-.9L19 8.3a2.1 2.1 0 0 0-3-3L5.2 16.1 4 20Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  )
}

export default Sidebar
