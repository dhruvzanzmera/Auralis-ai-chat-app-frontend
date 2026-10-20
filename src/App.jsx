import { useCallback, useEffect, useState } from 'react'
import { chatApi } from './api/chatApi'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import ChatInput from './components/ChatInput'

function App() {
  const [chats, setChats] = useState([])
  const [activeChatId, setActiveChatId] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
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

  const selectChat = async (chatId) => {
    if (loading) return
    setError('')
    setSidebarOpen(false)
    try {
      const { data } = await chatApi.get(`/chats/${chatId}`)
      setActiveChatId(data._id)
      setMessages(data.messages)
    } catch {
      setError('Could not open this conversation. Please try again.')
    }
  }

  const deleteChat = async (chatId) => {
    try {
      await chatApi.delete(`/chats/${chatId}`)
      setChats((current) => current.filter((chat) => chat._id !== chatId))
      if (activeChatId === chatId) startNewChat()
    } catch {
      setError('Could not delete this conversation. Please try again.')
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

  return (
    <div className="flex h-dvh overflow-hidden" style={{ background: '#f8f9fc' }}>
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
        activeChatId={activeChatId}
        open={sidebarOpen}
        onNewChat={startNewChat}
        onSelectChat={selectChat}
        onDeleteChat={deleteChat}
      />

      <main className="flex min-w-0 flex-1 flex-col" style={{ background: '#f8f9fc' }}>
        <header className="app-header flex h-14 shrink-0 items-center gap-3 px-4">
          <button
            aria-label="Open navigation"
            className="rounded-xl p-2 transition md:hidden"
            style={{ color: '#5c6bc0' }}
            onMouseEnter={e => e.currentTarget.style.background = '#eef0fb'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold" style={{ color: '#1a1a2e' }}>
              {activeChat?.title || 'New conversation'}
            </p>
            <p className="text-[11px]" style={{ color: '#8b93ad' }}>
              {activeChat ? 'Conversation' : 'Start with a question or an idea'}
            </p>
          </div>
          <span
            className="hidden shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium sm:inline-flex sm:items-center sm:gap-1.5"
            style={{ background: '#eef0fb', color: '#5c6bc0', border: '1px solid #e0e3f7' }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#7986cb' }} />
            AI Assistant
          </span>
        </header>

        <ChatWindow messages={messages} loading={loading} error={error} onSuggestion={sendMessage} />
        <ChatInput onSend={sendMessage} disabled={loading} />
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

export default App
