'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase/client'

interface ChatMessage {
  id: number
  sender: string
  message: string
  created_at: string
}

interface ChatRoomProps {
  onClose: () => void
}

export function ChatRoom({ onClose }: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [userName, setUserName] = useState('')
  const [isJoined, setIsJoined] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 共有ストレージから保存済みのユーザー名を読み込む
  useEffect(() => {
    // まず共有ストレージを確認し、その後チャット専用ストレージを確認する
    const sharedName = localStorage.getItem('birthday_user_name')
    const chatName = localStorage.getItem('birthdayChatUserName')
    const saved = sharedName || chatName
    
    if (saved) {
      setUserName(saved)
      setIsJoined(true)
      // Sync to shared storage
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
      setMessages(data || [])
    } catch {
      // 取得に失敗した場合は localStorage から読み込む
      const messagesData = localStorage.getItem('birthdayChatMessages')
      if (messagesData) {
        setMessages(JSON.parse(messagesData))
      }
    }
  }, [])

  // Realtime に購読する
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
          setMessages(prev => [...prev, payload.new as ChatMessage])
        })
        .subscribe()
    } catch {
      // Realtime が利用できない場合
    }

    return () => {
      if (channel) {
        try {
          getSupabase().removeChannel(channel)
        } catch {
          // Ignore
        }
      }
    }
  }, [isJoined, loadMessages])

  // 自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleJoin = () => {
    if (!userName.trim()) return
    // 互換性のため、両方のストレージに保存する
    localStorage.setItem('birthdayChatUserName', userName.trim())
    localStorage.setItem('birthday_user_name', userName.trim())
    setIsJoined(true)
  }

  const handleSend = async () => {
    if (!newMessage.trim() || loading) return

    const messageData: ChatMessage = {
      id: Date.now(),
      sender: userName,
      message: newMessage.trim(),
      created_at: new Date().toISOString(),
    }

    // 楽観的更新（先に画面だけ更新する）
    setMessages(prev => [...prev, messageData])
    setNewMessage('')
    setLoading(true)

    try {
      const supabase = getSupabase()
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          sender: userName,
          message: newMessage.trim(),
        })

      if (error) throw error
    } catch {
      // 失敗した場合は localStorage に保存してフォールバックする
      const chatMessages = JSON.parse(localStorage.getItem('birthdayChatMessages') || '[]')
      chatMessages.push(messageData)
      localStorage.setItem('birthdayChatMessages', JSON.stringify(chatMessages))
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // 参加画面
  if (!isJoined) {
    return (
      <div className="chat-modal show">
        <div className="chat-header">
          <h3 className="chat-title">誕生日グループチャット</h3>
          <div className="chat-controls">
            <span className="chat-btn" onClick={onClose}>×</span>
          </div>
        </div>
        <div className="chat-content" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <h4 style={{ marginBottom: '15px', color: 'var(--community-primary)' }}>
              チャットに参加するには名前を入力してください
            </h4>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="お名前..."
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
              チャットに参加
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`chat-modal show ${isMinimized ? '' : 'chat-modal-expanded'}`}>
      {/* ヘッダー */}
      <div className="chat-header">
        <h3 className="chat-title">グループチャット</h3>
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

      {/* メッセージ一覧 */}
      {!isMinimized && (
        <>
          <div className="chat-content">
            {messages.length === 0 ? (
              <p style={{ textAlign: 'center', opacity: 0.6 }}>
                まだメッセージがありません。会話を始めましょう！
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

          {/* 入力エリア */}
          <div className="chat-input-area">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="メッセージを入力..."
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
