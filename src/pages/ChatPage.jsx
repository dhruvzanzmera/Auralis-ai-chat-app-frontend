import { useCallback, useEffect, useState } from 'react'
import { chatApi, getApiMessage } from '../api/chatApi'
import { useAuth } from '../auth/useAuth'
import Sidebar from '../components/Sidebar'
import ChatWindow from '../components/ChatWindow'
import ChatInput from '../components/ChatInput'
import AdminNavigation from '../components/AdminNavigation'
import UserMenu from '../components/UserMenu'

function ChatPage() {
  const { user } = useAuth()
  const [chats, setChats] = useState([])
  const [chatsEmptyMessage, setChatsEmptyMessage] = useState('')
  const [chatsLoading, setChatsLoading] = useState(true)
  const [activeChatId, setActiveChatId] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [openingChatId, setOpeningChatId] = useState(null)
  const [regeneratingIndex, setRegeneratingIndex] = useState(null)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const activeChat = chats.find((chat) => chat._id === activeChatId)

  const refreshChats = useCallback(async () => {
    const { data } = await chatApi.get('/chats')
    setChats(Array.isArray(data) ? data : data.chats || [])
    setChatsEmptyMessage(Array.isArray(data) ? '' : data.message || '')
  }, [])

  useEffect(() => {
    let cancelled = false
    const loadChats = async () => {
      try {
        const { data } = await chatApi.get('/chats')
        if (!cancelled) {
          setChats(Array.isArray(data) ? data : data.chats || [])
          setChatsEmptyMessage(Array.isArray(data) ? '' : data.message || '')
        }
      } catch (requestError) {
        if (!cancelled) setError(getApiMessage(requestError))
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
    } catch (requestError) {
      setError(getApiMessage(requestError))
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
    } catch (requestError) {
      setError(getApiMessage(requestError))
      return false
    }
  }

  const renameChat = async (chatId, title) => {
    try {
      const { data } = await chatApi.patch(`/chats/${chatId}`, { title })
      setChats((current) => current
        .map((chat) => (
          chat._id === chatId
            ? {
                ...chat,
                title: data.title,
                updatedAt: data.updatedAt,
                deleteConfirmationMessage: data.deleteConfirmationMessage,
              }
            : chat
        ))
        .sort((first, second) => new Date(second.updatedAt) - new Date(first.updatedAt)))
      return true
    } catch (requestError) {
      setError(getApiMessage(requestError))
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
      setError(getApiMessage(requestError))
    } finally {
      setLoading(false)
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
      } catch (requestError) {
        setError(getApiMessage(requestError))
      }
      return true
    } catch (requestError) {
      setMessages(previousMessages)
      setError(getApiMessage(requestError))
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
        chatsEmptyMessage={chatsEmptyMessage}
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
          <div className="flex shrink-0 items-center gap-2">
            <AdminNavigation admin={user?.role === 'ADMIN'} />
            <UserMenu />
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
