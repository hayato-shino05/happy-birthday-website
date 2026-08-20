'use client'

import { useUIStore } from '@/lib/stores/uiStore'
import Modal from './Modal'
import { MemoryGame } from '@/components/games/MemoryGame'
import { PuzzleGame } from '@/components/games/PuzzleGame'
import { BirthdayCalendar } from '@/components/games/BirthdayCalendar'
import { BirthdayQuiz } from '@/components/games/BirthdayQuiz'
import { PhotoGallery } from '@/components/features/PhotoGallery'
import { MessageForm } from '@/components/community/MessageForm'
import BulletinBoard from '@/components/community/BulletinBoard'
import { ChatRoom } from '@/components/community/ChatRoom'
import { useLanguage } from '@/lib/i18n/LanguageContext'

import PhotoFrame from '@/components/features/PhotoFrame'

export function ModalManager() {
  const { activeModal, closeModal } = useUIStore()
  const { t } = useLanguage()

  if (!activeModal) return null

  // ChatRoom は独立したフローティングモーダルとして表示し、Modal ではラップしない
  if (activeModal === 'chat') {
    return <ChatRoom onClose={closeModal} />
  }

  const modalConfig: Record<string, { title: string; content: React.ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'widescreen' }> = {
    album: {
      title: t('viewAlbum') || 'アルバム',
      content: <PhotoGallery />,
      size: 'widescreen' as const,
    },
    photoFrame: {
      title: t('photoFrame') || '写真フレーム',
      content: <PhotoFrame />,
      size: 'widescreen' as const,
    },
    message: {
      title: t('sendMessage') || 'メッセージを送る',
      content: <MessageForm onSuccess={closeModal} />,
    },
    bulletin: {
      title: t('bulletinBoard') || '掲示板',
      content: <BulletinBoard />,
      size: 'full' as const,
    },
    memoryGame: {
      title: t('memoryGame') || '記憶ゲーム',
      content: <MemoryGame onClose={closeModal} />,
    },
    puzzleGame: {
      title: t('puzzleGame') || 'パズルゲーム',
      content: <PuzzleGame onClose={closeModal} />,
    },
    calendar: {
      title: t('birthdayCalendar') || '誕生日カレンダー',
      content: <BirthdayCalendar onClose={closeModal} />,
    },
    quiz: {
      title: t('birthdayQuiz') || '誕生日クイズ',
      content: <BirthdayQuiz onClose={closeModal} />,
    },
  }

  const config = modalConfig[activeModal]
  if (!config) return null

  // 設定されたサイズがあれば使用し、なければデフォルトサイズを使用する
  const size = config.size || 'lg'

  return (
    <Modal isOpen={true} onClose={closeModal} title={config.title} size={size}>
      {config.content}
    </Modal>
  )
}
