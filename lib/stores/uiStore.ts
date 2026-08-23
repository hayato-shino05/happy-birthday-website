import { create } from 'zustand'

export type ModalType = 
  | 'album'
  | 'message'
  | 'bulletin'
  | 'memoryGame'
  | 'puzzleGame'
  | 'calendar'
  | 'quiz'
  | 'chat'
  | 'photoFrame'
  | 'flashback'
  | 'omikuji'
  | 'timeCapsule'
  | null

interface UIState {
  activeModal: ModalType
  openModal: (modal: ModalType) => void
  closeModal: () => void
}

// モーダルを開く直前にフォーカスされていた要素（閉じた際の復元先）
let lastModalTrigger: HTMLElement | null = null

// モーダル unmount 後にトリガーへフォーカスを返す共有ライフサイクル。
// 個別モーダル側の restore が unmount 順序で失敗しても、ここで最終保証する。
function restoreTriggerFocus(): void {
  if (typeof window === 'undefined') return
  requestAnimationFrame(() => {
    const active = document.activeElement
    if (active === document.body || active === null) {
      if (lastModalTrigger?.isConnected) {
        lastModalTrigger.focus()
      } else {
        // トリガー要素が unmount された場合（モバイルメニュー等）、永続的なナビゲーションボタンへ安全にフォールバック
        const fallback = document.querySelector(
          'header button:not([disabled]), nav button:not([disabled]), .mobile-game-toggle:not([disabled]), main button:not([disabled])'
        ) as HTMLElement | null
        fallback?.focus()
      }
    }
  })
}

export const useUIStore = create<UIState>((set) => ({
  activeModal: null,
  openModal: (modal) => {
    if (typeof document !== 'undefined') {
      lastModalTrigger =
        document.activeElement instanceof HTMLElement ? document.activeElement : null
    }
    set({ activeModal: modal })
  },
  closeModal: () => {
    set({ activeModal: null })
    // lastModalTrigger は次回 open で上書きするため、ここではクリアしない
    restoreTriggerFocus()
  },
}))
