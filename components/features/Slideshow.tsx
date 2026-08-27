'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { MediaFile } from '@/types'
import { Icon } from '@/components/ui/Icon'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface SlideshowProps {
  media: MediaFile[]
  autoPlay?: boolean
  interval?: number
  onClose: () => void
}

export function Slideshow({ media, autoPlay = true, interval = 5000, onClose }: SlideshowProps) {
  const { t } = useLanguage()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoPlay)

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % media.length)
  }, [media.length])

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length)
  }, [media.length])

  // 自動再生
  useEffect(() => {
    if (!isPlaying) return

    const timer = setInterval(goToNext, interval)
    return () => clearInterval(timer)
  }, [isPlaying, interval, goToNext])

  // キーボード操作によるナビゲーション
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goToPrev()
      if (e.key === 'ArrowRight') goToNext()
      if (e.key === ' ') {
        e.preventDefault()
        setIsPlaying((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, goToPrev, goToNext])

  const currentMedia = media[currentIndex]
  const isVideo = currentMedia?.file_type === 'video'

  if (media.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        zIndex: 3000,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* メインコンテンツ */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            style={{
              maxWidth: '90vw',
              maxHeight: '80vh',
            }}
          >
            {isVideo ? (
              <video
                src={currentMedia.file_path}
                autoPlay
                muted
                style={{
                  maxWidth: '90vw',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                }}
              />
            ) : (
              // Media paths may be private or signed URLs and are not statically allowlisted.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentMedia.file_path}
                alt={currentMedia.file_name}
                style={{
                  maxWidth: '90vw',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* 矢印ナビゲーション */}
        <button
          onClick={goToPrev}
          aria-label={t('previousMedia')}
          style={{
            position: 'absolute',
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            cursor: 'pointer',
            fontSize: '1.5rem',
          }}
        >
          <Icon name="ArrowLeft" size={24} />
        </button>
        <button
          onClick={goToNext}
          aria-label={t('nextMedia')}
          style={{
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            cursor: 'pointer',
            fontSize: '1.5rem',
          }}
        >
          <Icon name="ArrowRight" size={24} />
        </button>
      </div>

      {/* コントロール */}
      <div
        style={{
          padding: '20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '20px',
          background: 'rgba(0, 0, 0, 0.5)',
        }}
      >
        <button
          onClick={() => setIsPlaying((prev) => !prev)}
          style={{
            padding: '10px 20px',
            background: '#854D27',
            color: '#FFF9F3',
            border: '2px solid #D4B08C',
            borderRadius: 0,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            fontSize: '0.9rem',
            boxShadow: '2px 2px 0 #D4B08C',
          }}
        >
          <Icon name={isPlaying ? 'Pause' : 'Play'} size={18} /> {isPlaying ? t('pause') : t('play')}
        </button>

        <span style={{ color: '#fff', fontSize: '0.9rem' }}>
          {currentIndex + 1} / {media.length}
        </span>

        <button
          onClick={onClose}
          style={{
            padding: '10px 20px',
            background: 'transparent',
            color: '#FFF9F3',
            border: '2px solid #D4B08C',
            borderRadius: 0,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            fontSize: '0.9rem',
          }}
        >
          <Icon name="X" size={18} /> {t('close')}
        </button>
      </div>

      {/* 進行状況ドット */}
      <div
        style={{
          position: 'absolute',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '8px',
        }}
      >
        {media.slice(0, 10).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            aria-label={t('slide', { index: i + 1 })}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              border: 'none',
              background: i === currentIndex ? '#854D27' : 'rgba(255, 255, 255, 0.3)',
              cursor: 'pointer',
              transition: 'background 0.3s',
            }}
          />
        ))}
        {media.length > 10 && (
          <span style={{ color: '#fff', fontSize: '0.8rem' }}>+{media.length - 10}</span>
        )}
      </div>
    </motion.div>
  )
}
