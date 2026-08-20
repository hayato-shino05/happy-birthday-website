'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '@/components/ui/Icon'

interface CameraCaptureProps {
  mode: 'photo' | 'video'
  onCapture: (file: File) => void
  onClose: () => void
}

export function CameraCapture({ mode, onCapture, onClose }: CameraCaptureProps) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [cameraReady, setCameraReady] = useState(false)

  // カメラを起動する
  useEffect(() => {
    let mounted = true

    const startCamera = async () => {
      try {
        // まずは環境カメラ（モバイルの背面カメラ）を優先して取得する
        let stream: MediaStream | null = null
        
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: mode === 'video',
          })
        } catch {
          // 取得に失敗したら任意の利用可能なカメラ（デスクトップなど）にフォールバック
          console.log('Environment camera not available, trying default camera')
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: mode === 'video',
          })
        }
        
        if (!mounted) {
          stream.getTracks().forEach(track => track.stop())
          return
        }

        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          // ビデオの準備が完了するのを待つ
          videoRef.current.onloadedmetadata = () => {
            if (mounted && videoRef.current) {
              videoRef.current.play()
                .then(() => {
                  if (mounted) setCameraReady(true)
                })
                .catch(err => {
                  console.error('Video play error:', err)
                  if (mounted) setError('カメラからビデオを再生できません。')
                })
            }
          }
        }
      } catch (err) {
        console.error('Camera error:', err)
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        if (mounted) {
          if (errorMessage.includes('Permission denied') || errorMessage.includes('NotAllowedError')) {
            setError('ブラウザの設定でカメラへのアクセスを許可してください。')
          } else if (errorMessage.includes('NotFoundError') || errorMessage.includes('DevicesNotFoundError')) {
            setError('このデバイスにカメラが見つかりません。')
          } else {
            setError(`カメラにアクセスできません: ${errorMessage}`)
          }
        }
      }
    }

    startCamera()

    return () => {
      mounted = false
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [mode])

  // 録画時間のタイマー
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }, [])

  const capturePhoto = useCallback((e?: React.MouseEvent) => {
    // 親モーダルへのイベントバブリングを防ぐ
    e?.preventDefault()
    e?.stopPropagation()
    
    if (!videoRef.current || !cameraReady) return

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    ctx.drawImage(videoRef.current, 0, 0)
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' })
        // onCapture を呼び出す前にカメラを停止する
        stopCamera()
        // 状態更新が正しく反映されるように setTimeout を使用
        setTimeout(() => {
          onCapture(file)
        }, 100)
      }
    }, 'image/jpeg', 0.9)
  }, [cameraReady, onCapture, stopCamera])

  const startRecording = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    
    if (!streamRef.current) return

// 利用可能な動画 MIME タイプをブラウザごとに安全に取得（iOS Safari対応）
function getSupportedVideoMimeType(): string | undefined {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') return undefined
  const candidates = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4;codecs=avc1',
    'video/mp4',
  ]
  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type
    }
  }
  return undefined
}

    chunksRef.current = []
    const supportedMimeType = getSupportedVideoMimeType()
    const mediaRecorder = supportedMimeType
      ? new MediaRecorder(streamRef.current, { mimeType: supportedMimeType })
      : new MediaRecorder(streamRef.current)

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data)
      }
    }

    mediaRecorder.onstop = () => {
      const mimeType = mediaRecorderRef.current?.mimeType || supportedMimeType || 'video/webm'
      const isMp4 = mimeType.includes('mp4')
      const blob = new Blob(chunksRef.current, { type: mimeType })
      const file = new File([blob], `video_${Date.now()}.${isMp4 ? 'mp4' : 'webm'}`, { type: mimeType })
      // onCapture を呼び出す前にカメラを停止する
      stopCamera()
      // 状態更新が正しく反映されるように setTimeout を使用
      setTimeout(() => {
        onCapture(file)
      }, 100)
    }

    mediaRecorderRef.current = mediaRecorder
    mediaRecorder.start()
    setIsRecording(true)
    setRecordingTime(0)
  }, [onCapture, stopCamera])

  const stopRecording = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [isRecording])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleClose = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    stopCamera()
    onClose()
  }, [stopCamera, onClose])

  const cameraContent = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        zIndex: 100000,
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {/* Header */}
      {/* ヘッダー */}
      <div
        style={{
          padding: '15px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(0,0,0,0.5)',
        }}
      >
        <span style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600 }}>
          <Icon name={mode === 'photo' ? 'Camera' : 'Video'} size={20} style={{ color: '#fff', verticalAlign: 'middle', marginRight: '8px' }} />
          {mode === 'photo' ? '写真を撮る' : 'ビデオを撮る'}
        </span>
        <button
          onClick={handleClose}
          aria-label="閉じる"
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            cursor: 'pointer',
            fontSize: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="X" size={20} style={{ color: '#fff' }} />
        </button>
      </div>

      {/* カメラビュー */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {error ? (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            color: '#fff',
            textAlign: 'center',
            padding: '20px',
          }}>
            <p>{error}</p>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}

        {/* 録画中インジケーター */}
        {isRecording && (
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(220, 53, 69, 0.9)',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ 
              width: '10px', 
              height: '10px', 
              background: '#fff', 
              borderRadius: '50%',
              animation: 'pulse 1s infinite',
            }} />
            <span>{formatTime(recordingTime)}</span>
          </div>
        )}
      </div>

      {/* コントロール */}
      <div
        style={{
          padding: '30px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '30px',
          background: 'rgba(0,0,0,0.5)',
        }}
      >
        {mode === 'photo' ? (
          <button
            onClick={capturePhoto}
            disabled={!cameraReady}
            style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: '#fff',
              border: '4px solid #D4B08C',
              cursor: cameraReady ? 'pointer' : 'not-allowed',
              opacity: cameraReady ? 1 : 0.5,
            }}
          />
        ) : (
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={!cameraReady}
            style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: isRecording ? '#dc3545' : '#fff',
              border: '4px solid #D4B08C',
              cursor: cameraReady ? 'pointer' : 'not-allowed',
              opacity: cameraReady ? 1 : 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isRecording && (
              <div style={{ width: '24px', height: '24px', background: '#fff', borderRadius: '4px' }} />
            )}
          </button>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )

  // 親モーダルとのイベント競合を避けるためにポータル経由で描画する
  if (!mounted || typeof window === 'undefined') return null
  
  return createPortal(cameraContent, document.body)
}
