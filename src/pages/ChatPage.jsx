import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { chatApi } from '../api/chatApi'
import { useAuth } from '../auth/useAuth'
import Sidebar from '../components/Sidebar'
import ChatWindow from '../components/ChatWindow'
import ChatInput from '../components/ChatInput'
import { LogoutIcon, UserIcon } from '../components/HeaderIcons'

function ChatPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [chats, setChats] = useState([])
  const [chatsLoading, setChatsLoading] = useState(true)
  const [activeChatId, setActiveChatId] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [openingChatId, setOpeningChatId] = useState(null)
  const [loggingOut, setLoggingOut] = useState(false)
  const [regeneratingIndex, setRegeneratingIndex] = useState(null)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const activeChat = chats.find((chat) => chat._id === activeChatId)

  const refreshChats = useCallback(async () => {
    const { data } = await chatApi.get('/chats')
    setChats(data)
  }, [])

  useEffect(() => {
    let cancelled = false
    const loadChats = async () => {
      try {
        const { data } = await chatApi.get('/chats')
        if (!cancelled) setChats(data)
      } catch {
        if (!cancelled) setError('Could not load your conversations. Check that the server is running.')
      } finally {
        if (!cancelled) setChatsLoading(false)
      }
    }
    loadChats()
    return () => { cancelled = true }
  }, [])

  const startNewChat = () => {
    setActiveChatId(null)
    setMessages([])
    setError('')
    setSidebarOpen(false)
  }

  const toggleNavigation = () => {
    if (window.matchMedia('(min-width: 768px)').matches) {
      setSidebarCollapsed((current) => !current)
      return
    }
    setSidebarOpen(true)
  }

  const closeNavigation = useCallback(() => setSidebarOpen(false), [])

  const selectChat = async (chatId) => {
    if (loading || openingChatId) return
    setError('')
    setSidebarOpen(false)
    setOpeningChatId(chatId)
    try {
      const { data } = await chatApi.get(`/chats/${chatId}`)
      setActiveChatId(data._id)
      setMessages(data.messages)
    } catch {
      setError('Could not open this conversation. Please try again.')
    } finally {
      setOpeningChatId(null)
    }
  }

  const deleteChat = async (chatId) => {
    try {
      await chatApi.delete(`/chats/${chatId}`)
      setChats((current) => current.filter((chat) => chat._id !== chatId))
      if (activeChatId === chatId) startNewChat()
      return true
    } catch {
      setError('Could not delete this conversation. Please try again.')
      return false
    }
  }

  const renameChat = async (chatId, title) => {
    try {
      const { data } = await chatApi.patch(`/chats/${chatId}`, { title })
      setChats((current) => current
        .map((chat) => (
          chat._id === chatId ? { ...chat, title: data.title, updatedAt: data.updatedAt } : chat
        ))
        .sort((first, second) => new Date(second.updatedAt) - new Date(first.updatedAt)))
      return true
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not rename this conversation. Please try again.')
      return false
    }
  }

  const sendMessage = async (prompt) => {
    setError('')
    setLoading(true)
    setMessages((current) => [...current, { role: 'user', content: prompt, createdAt: new Date().toISOString() }])
    try {
      const { data } = await chatApi.post('/chats/message', { chatId: activeChatId, prompt })
      setActiveChatId(data.chatId)
      setMessages((current) => [...current, data.aiMessage])
      await refreshChats()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not sign out. Please try again.')
    } finally {
      setLoggingOut(false)
    }
  }

  const editMessage = async (messageIndex, prompt) => {
    if (!activeChatId) return false

    const previousMessages = messages
    setError('')
    setLoading(true)
    setRegeneratingIndex(messageIndex)
    setMessages((current) => [
      ...current.slice(0, messageIndex),
      { ...current[messageIndex], content: prompt, createdAt: new Date().toISOString() },
    ])
    try {
      const { data } = await chatApi.patch(`/chats/${activeChatId}/messages/${messageIndex}`, { prompt })
      setMessages(data.messages)
      setLoading(false)
      setRegeneratingIndex(null)
      try {
        await refreshChats()
      } catch {
        setError('Your prompt was updated, but the conversation list could not be refreshed.')
      }
      return true
    } catch (requestError) {
      setMessages(previousMessages)
      setError(requestError.response?.data?.message || 'Could not edit this prompt. Please try again.')
      return false
    } finally {
      setLoading(false)
      setRegeneratingIndex(null)
    }
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-[#f7f8fc]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-20 md:hidden"
          style={{ background: 'rgba(26,26,46,0.35)', backdropFilter: 'blur(2px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        chats={chats}
        chatsLoading={chatsLoading}
        navigationBusy={loading || Boolean(openingChatId)}
        openingChatId={openingChatId}
        activeChatId={activeChatId}
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onClose={closeNavigation}
        onNewChat={startNewChat}
        onSelectChat={selectChat}
        onDeleteChat={deleteChat}
        onRenameChat={renameChat}
      />

      <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#f7f8fc]">
        <header className="app-header flex h-14 shrink-0 items-center gap-3 px-4">
          <button
            type="button"
            aria-label="Toggle conversation navigation"
            aria-controls="conversation-navigation"
            aria-expanded={window.matchMedia('(min-width: 768px)').matches ? !sidebarCollapsed : sidebarOpen}
            className="rounded-xl p-2 text-[#5961b7] transition hover:bg-[#eff0ff]"
            onClick={toggleNavigation}
          >
            <MenuIcon />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold" style={{ color: '#1a1a2e' }}>
              {activeChat?.title || 'New conversation'}
            </p>
            <p className="text-[11px]" style={{ color: '#8b93ad' }}>
              {activeChat ? 'Your conversation' : 'Start with a question or an idea'}
            </p>
          </div>
          <span
            className="hidden shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium sm:inline-flex sm:items-center sm:gap-1.5"
            style={{ background: '#eef0fb', color: '#5c6bc0', border: '1px solid #e0e3f7' }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#7986cb' }} />
            AI Assistant
          </span>
          <div className="flex shrink-0 items-center gap-1">
            <Link to="/account" aria-label="Account" title="Account" className="rounded-lg p-2 text-[#5c6bc0] transition hover:bg-[#eef0fb]">
              <UserIcon />
            </Link>
            {user?.role === 'ADMIN' && <Link to="/admin" className="rounded-lg px-2.5 py-2 text-xs font-medium text-[#5c6bc0] transition hover:bg-[#eef0fb]">Admin</Link>}
            <button onClick={handleLogout} disabled={loggingOut} aria-label={loggingOut ? 'Signing out' : 'Sign out'} title={loggingOut ? 'Signing out…' : 'Sign out'} aria-busy={loggingOut} className="flex h-10 w-10 items-center justify-center rounded-lg p-2 text-[#7986a8] transition hover:bg-[#fce8e8] hover:text-[#c62828] disabled:cursor-wait disabled:opacity-60">
              {loggingOut
                ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                : <LogoutIcon />
              }
            </button>
          </div>
        </header>

        <ChatWindow
          messages={messages}
          loading={loading}
          loadingChat={Boolean(openingChatId)}
          error={error}
          onSuggestion={sendMessage}
          onEditMessage={editMessage}
          regeneratingIndex={regeneratingIndex}
        />
        <ChatInput onSend={sendMessage} disabled={loading || Boolean(openingChatId)} loading={loading} />
      </main>
    </div>
  )
}

function MenuIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
    </svg>
  )
}

export default ChatPage
