import { create } from 'zustand'

type ModalType = 
  | 'album'
  | 'message'
  | 'bulletin'
  | 'memoryGame'
  | 'puzzleGame'
  | 'calendar'
  | 'quiz'
  | 'chat'
  | null

interface UIState {
  activeModal: ModalType
  openModal: (modal: ModalType) => void
  closeModal: () => void
}

export const useUIStore = create<UIState>((set) => ({
  activeModal: null,
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
}))
