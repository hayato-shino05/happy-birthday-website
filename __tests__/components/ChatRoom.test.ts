import { describe, expect, it } from 'vitest'
import {
  appendRealtimeChatMessage,
  mergeLoadedChatMessages,
  reconcileInsertedChatMessage,
  type ChatMessage,
} from '@/components/community/ChatRoom'

const pendingMessage: ChatMessage = {
  id: -100,
  sender: 'Alex',
  message: 'Happy birthday',
  created_at: '2026-08-15T12:00:00.000Z',
  pending: true,
}

const insertedMessage: ChatMessage = {
  id: 42,
  sender: 'Alex',
  message: 'Happy birthday',
  created_at: '2026-08-15T12:00:01.000Z',
}

describe('ChatRoom message reconciliation', () => {
  it('does not consume a pending message from a realtime event by content', () => {
    const messages = appendRealtimeChatMessage([pendingMessage], insertedMessage)

    expect(messages).toEqual([pendingMessage, insertedMessage])
  })

  it('replaces the optimistic message when the insert response arrives first', () => {
    expect(
      reconcileInsertedChatMessage([pendingMessage], pendingMessage.id, insertedMessage)
    ).toEqual([insertedMessage])
  })

  it('removes the optimistic message when realtime already supplied the inserted row', () => {
    expect(
      reconcileInsertedChatMessage(
        [pendingMessage, insertedMessage],
        pendingMessage.id,
        insertedMessage
      )
    ).toEqual([insertedMessage])
  })

  it('deduplicates the inserted row by server id despite timestamp differences', () => {
    const delayedRealtimeMessage = {
      ...insertedMessage,
      created_at: '2026-08-15T12:30:00.000Z',
    }

    expect(appendRealtimeChatMessage([insertedMessage], delayedRealtimeMessage)).toEqual([
      insertedMessage,
    ])
  })

  it('removes a persisted fallback when the server response arrives later', () => {
    const fallbackMessage = { ...pendingMessage, pending: false }

    expect(
      reconcileInsertedChatMessage([fallbackMessage], pendingMessage.id, insertedMessage)
    ).toEqual([insertedMessage])
  })

  it('retains realtime inserts when a stale load resolves afterward', () => {
    const staleLoadedMessage: ChatMessage = {
      ...insertedMessage,
      id: 41,
      message: 'Earlier message',
      created_at: '2026-08-15T11:59:00.000Z',
    }
    const fallbackMessage = { ...pendingMessage, pending: false }
    const loadInFlight = [staleLoadedMessage]
    const currentAfterRealtimeInsert = appendRealtimeChatMessage(
      [fallbackMessage],
      insertedMessage,
    )

    expect(mergeLoadedChatMessages(loadInFlight, currentAfterRealtimeInsert)).toEqual([
      staleLoadedMessage,
      fallbackMessage,
      insertedMessage,
    ])
  })
})
