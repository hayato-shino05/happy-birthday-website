'use client'

import { useEffect, useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import type { MediaFile } from '@/types'

const SLIDESHOW_INTERVAL = 3000

interface MediaViewerProps {
  media: MediaFile
  allMedia: MediaFile[]
  onClose: () => void
  onNavigate: (media: MediaFile) => void
  slideshowMode?: boolean
  onToggleSlideshow?: () => void
}

export function MediaViewer({ 
  media, 
  allMedia, 
  onClose, 
  onNavigate,
  slideshowMode = false,
  onToggleSlideshow,
}: MediaViewerProps) {
  const [isPlaying, setIsPlaying] = useState(slideshowMode)
  const [mounted, setMounted] = useState(false)
  const currentIndex = allMedia.findIndex((m) => m.id === media.id)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      onNavigate(allMedia[currentIndex - 1])
    } else {
      onNavigate(allMedia[allMedia.length - 1])
    }
  }, [currentIndex, allMedia, onNavigate])

  const goToNext = useCallback(() => {
    if (currentIndex < allMedia.length - 1) {
      onNavigate(allMedia[currentIndex + 1])
    } else {
      onNavigate(allMedia[0])
    }
  }, [currentIndex, allMedia, onNavigate])

  useEffect(() => {
    if (!isPlaying) return
    if (media.file_type === 'video') return

    const timer = setTimeout(() => {
      goToNext()
    }, SLIDESHOW_INTERVAL)

    return () => clearTimeout(timer)
  }, [isPlaying, media, goToNext])

  useEffect(() => {
    setIsPlaying(slideshowMode)
  }, [slideshowMode])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') {
        setIsPlaying(false)
        goToPrev()
      }
      if (e.key === 'ArrowRight') {
        setIsPlaying(false)
        goToNext()
      }
      if (e.key === ' ') {
        e.preventDefault()
        setIsPlaying(!isPlaying)
        onToggleSlideshow?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose, goToPrev, goToNext, isPlaying, onToggleSlideshow])

  const isVideo = media.file_type === 'video'

  const handleToggleSlideshow = () => {
    setIsPlaying(!isPlaying)
    onToggleSlideshow?.()
  }

  const viewerContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: '#000',
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* 上部コントロール */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '15px',
            alignItems: 'center',
            zIndex: 1000000,
          }}
        >
          <div
            style={{
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 500,
              background: 'rgba(0,0,0,0.6)',
              padding: '10px 20px',
              borderRadius: '25px',
            }}
          >
            {currentIndex + 1} / {allMedia.length}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              handleToggleSlideshow()
            }}
            style={{
              background: isPlaying ? 'rgba(133, 77, 39, 0.9)' : 'rgba(255, 255, 255, 0.2)',
              color: '#fff',
              border: 'none',
              borderRadius: '25px',
              padding: '10px 20px',
              cursor: 'pointer',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
          >
            {isPlaying ? (
              <>
                <span>⏸</span>
                <span>一時停止</span>
              </>
            ) : (
              <>
                <span>▶</span>
                <span>スライドショー</span>
              </>
            )}
          </button>
        </div>

        {/* 閉じるボタン */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.2)',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '56px',
            height: '56px',
            cursor: 'pointer',
            fontSize: '1.8rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000000,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
          }}
        >
          ✕
        </button>

        {/* 前へボタン */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsPlaying(false)
            goToPrev()
          }}
          style={{
            position: 'absolute',
            left: '30px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255, 255, 255, 0.2)',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '70px',
            height: '70px',
            cursor: 'pointer',
            fontSize: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000000,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
          }}
        >
          ‹
        </button>

        {/* 次へボタン */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsPlaying(false)
            goToNext()
          }}
          style={{
            position: 'absolute',
            right: '30px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255, 255, 255, 0.2)',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '70px',
            height: '70px',
            cursor: 'pointer',
            fontSize: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000000,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
          }}
        >
          ›
        </button>

        {/* メディア表示エリア（フルスクリーン） */}
        <motion.div
          key={media.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '100px 120px',
            boxSizing: 'border-box',
          }}
        >
          {isVideo ? (
            <video
              src={media.file_path}
              controls
              autoPlay
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
              onPlay={() => setIsPlaying(false)}
            />
          ) : (
            <img
              src={media.file_path}
              alt={media.file_name}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
            />
          )}
        </motion.div>

        {/* スライドショー用のプログレスバー */}
        {isPlaying && !isVideo && (
          <div
            style={{
              position: 'absolute',
              bottom: '80px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '250px',
              height: '5px',
              background: 'rgba(255,255,255,0.3)',
              borderRadius: '3px',
              overflow: 'hidden',
              zIndex: 1000000,
            }}
          >
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: SLIDESHOW_INTERVAL / 1000, ease: 'linear' }}
              key={media.id}
              style={{
                height: '100%',
                background: '#854D27',
              }}
            />
          </div>
        )}

        {/* 下部のファイル名表示 */}
        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#fff',
            fontSize: '1rem',
            zIndex: 1000000,
            background: 'rgba(0,0,0,0.6)',
            padding: '10px 24px',
            borderRadius: '25px',
            maxWidth: '80%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {media.file_name}
        </div>
      </motion.div>
    </AnimatePresence>
  )

  // 親コンテナの外側に描画するためにポータルを利用
  if (!mounted) return null
  
  return createPortal(viewerContent, document.body)
}
