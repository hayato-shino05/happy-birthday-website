'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface ChatMessage {
  id: number
  sender: string
  message: string
  created_at: string
  pending?: boolean
}

function parseChatMessage(value: unknown): ChatMessage | null {
  if (typeof value !== 'object' || value === null) return null
  const record = value as Record<string, unknown>
  const message = typeof record.message === 'string'
    ? record.message
    : typeof record.text === 'string'
      ? record.text
      : null

  if (
    typeof record.id !== 'number' ||
    typeof record.sender !== 'string' ||
    message === null ||
    typeof record.created_at !== 'string'
  ) return null

  return {
    id: record.id,
    sender: record.sender,
    message,
    created_at: record.created_at,
  }
}

interface ChatRoomProps {
  onClose: () => void
}

export function ChatRoom({ onClose }: ChatRoomProps) {
  const { locale, t } = useLanguage()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [userName, setUserName] = useState('')
  const [isJoined, setIsJoined] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 共有ストレージから保存済みのユーザー名を読み込む
  useEffect(() => {
    // 共有ストレージを優先し、次にチャット専用領域を確認する
    const sharedName = localStorage.getItem('birthday_user_name')
    const chatName = localStorage.getItem('birthdayChatUserName')
    const saved = sharedName || chatName

    if (saved) {
      setUserName(saved)
      setIsJoined(true)
      // 共有ストレージへ同期する
      if (!sharedName && chatName) {
        localStorage.setItem('birthday_user_name', chatName)
      }
    }
  }, [])

  // チャット履歴を読み込む
  const loadMessages = useCallback(async () => {
    try {
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100)

      if (error) {
        if (error.code === '42P01') return
        throw error
      }
      setMessages(
        data?.map(parseChatMessage).filter((message): message is ChatMessage => message !== null) ?? [],
      )
    } catch {
      // フォールバックとしてlocalStorageから読み込む
      const messagesData = localStorage.getItem('birthdayChatMessages')
      if (messagesData) {
        const parsed = JSON.parse(messagesData) as unknown
        if (Array.isArray(parsed)) {
          setMessages(parsed.map(parseChatMessage).filter((message): message is ChatMessage => message !== null))
        }
      }
    }
  }, [])

  // リアルタイム更新を購読する
  useEffect(() => {
    if (!isJoined) return

    loadMessages()

    let channel: ReturnType<typeof getSupabase>['channel'] extends (name: string) => infer R ? R : never
    try {
      const supabase = getSupabase()
      channel = supabase
        .channel('public:chat_messages')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        }, (payload) => {
          const message = parseChatMessage(payload.new)
          if (!message) return
          setMessages((prev) => {
            const pendingIndex = prev.findIndex((item) =>
              item.pending &&
              item.sender === message.sender &&
              item.message === message.message &&
              Math.abs(new Date(item.created_at).getTime() - new Date(message.created_at).getTime()) <= 30000,
            )
            if (pendingIndex >= 0) {
              return prev.map((item, index) => index === pendingIndex ? message : item)
            }
            if (prev.some((item) => item.id === message.id && !item.pending)) {
              return prev
            }
            return [...prev, message]
          })
        })
        .subscribe()
    } catch {
      // リアルタイム更新が利用できない
    }

    return () => {
      if (channel) {
        try {
          getSupabase().removeChannel(channel)
        } catch {
          // このエラーは無視する
        }
      }
    }
  }, [isJoined, loadMessages])

  // 最新メッセージへ自動スクロールする
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleJoin = () => {
    if (!userName.trim()) return
    // 互換性のため両方のストレージへ保存する
    localStorage.setItem('birthdayChatUserName', userName.trim())
    localStorage.setItem('birthday_user_name', userName.trim())
    setIsJoined(true)
  }

  const handleSend = async () => {
    const trimmedMessage = newMessage.trim()
    if (!trimmedMessage || loading) return

    const messageData: ChatMessage = {
      id: Date.now(),
      sender: userName,
      message: trimmedMessage,
      created_at: new Date().toISOString(),
      pending: true,
    }

    // 先行して画面を更新する
    setMessages(prev => [...prev, messageData])
    setNewMessage('')
    setLoading(true)

    try {
      const supabase = getSupabase()
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          sender: userName,
          message: trimmedMessage,
        })

      if (error) throw error
    } catch {
      // フォールバックとしてlocalStorageへ保存する
      const fallbackMessage = { ...messageData, pending: false }
      setMessages((prev) => prev.map((item) => item.id === messageData.id ? fallbackMessage : item))
      const chatMessages = JSON.parse(localStorage.getItem('birthdayChatMessages') || '[]')
      chatMessages.push(fallbackMessage)
      localStorage.setItem('birthdayChatMessages', JSON.stringify(chatMessages))
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // 参加画面
  if (!isJoined) {
    return (
      <div className="chat-modal show">
        <div className="chat-header">
          <h3 className="chat-title">{t('groupChat')}</h3>
          <div className="chat-controls">
            <span className="chat-btn" onClick={onClose}>×</span>
          </div>
        </div>
        <div className="chat-content" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <h4 style={{ marginBottom: '15px', color: 'var(--community-primary)' }}>
              {t('enterNameToChat')}
            </h4>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder={`${t('yourName')}...`}
              onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
              className="chat-message-input"
              style={{ marginBottom: '15px', width: '100%' }}
            />
            <button
              onClick={handleJoin}
              disabled={!userName.trim()}
              className="chat-send-btn"
              style={{ width: '100%', opacity: userName.trim() ? 1 : 0.5 }}
            >
              {t('joinChat')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`chat-modal show ${isMinimized ? '' : 'chat-modal-expanded'}`}>

      <div className="chat-header">
        <h3 className="chat-title">{t('groupChat')}</h3>
        <div className="chat-controls">
          <span
            className="chat-btn chat-minimize"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            _
          </span>
          <span className="chat-btn" onClick={onClose}>×</span>
        </div>
      </div>


      {!isMinimized && (
        <>
          <div className="chat-content">
            {messages.length === 0 ? (
              <p style={{ textAlign: 'center', opacity: 0.6 }}>
                {t('startConversation')}
              </p>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender === userName
                return (
                  <div
                    key={msg.id}
                    className={`chat-message ${isMe ? 'chat-message--sender' : 'chat-message--receiver'}`}
                  >
                    <div className="chat-message__sender">{msg.sender}</div>
                    {msg.message}
                    <div className="chat-message__time">{formatTime(msg.created_at)}</div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>


          <div className="chat-input-area">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('typeMessage')}
              className="chat-message-input"
            />
            <button
              onClick={handleSend}
              disabled={!newMessage.trim() || loading}
              className="chat-send-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
