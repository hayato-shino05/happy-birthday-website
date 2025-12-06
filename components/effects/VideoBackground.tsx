'use client'

import { useState, useRef, useEffect } from 'react'

interface VideoBackgroundProps {
  videoUrl?: string
  fallbackUrl?: string
  active?: boolean
}

export function VideoBackground({ videoUrl, fallbackUrl, active = true }: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [currentSrc, setCurrentSrc] = useState(videoUrl)
  const [hasError, setHasError] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)

  useEffect(() => {
    if (videoUrl) {
      setCurrentSrc(videoUrl)
      setHasError(false)
      setVideoLoaded(false)
    }
  }, [videoUrl])

  // 読み込み完了時に自動再生する
  useEffect(() => {
    if (videoRef.current && videoLoaded) {
      videoRef.current.play().catch(() => {
      })
    }
  }, [videoLoaded])

  const handleError = () => {
    console.log('Video error, trying fallback:', fallbackUrl)
    if (!hasError && fallbackUrl) {
      setCurrentSrc(fallbackUrl)
      setHasError(true)
    } else {
      setHasError(true)
    }
  }

  const handleLoadedData = () => {
    console.log('Video loaded:', currentSrc)
    setVideoLoaded(true)
  }

  const handleCanPlay = () => {
    console.log('Video can play:', currentSrc)
    setVideoLoaded(true)
  }

  if (!active) return null

  // ソースがある場合はビデオを表示
  if (currentSrc) {
    return (
      <video
        ref={videoRef}
        className="video-background"
        autoPlay
        loop
        muted
        playsInline
        onError={handleError}
        onLoadedData={handleLoadedData}
        onCanPlay={handleCanPlay}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      >
        <source src={currentSrc} type="video/mp4" />
      </video>
    )
  }

  // ビデオがない場合のフォールバック（グラデーション背景）
  return (
    <div
      className="video-background-fallback"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        background: 'linear-gradient(135deg, var(--theme-background) 0%, var(--theme-secondary) 50%, var(--theme-background) 100%)',
      }}
    />
  )
}
