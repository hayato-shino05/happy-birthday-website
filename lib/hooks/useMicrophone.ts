'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface UseMicrophoneOptions {
  onBlowDetected?: () => void
  threshold?: number
}

// マイク入力を処理するカスタムフック
export function useMicrophone({ onBlowDetected, threshold = 0.3 }: UseMicrophoneOptions = {}) {
  const [isListening, setIsListening] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [audioLevel, setAudioLevel] = useState(0)

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // マイク権限をリクエスト
  const requestPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      setHasPermission(true)
      return true
    } catch (error) {
      console.error('マイク権限エラー:', error)
      setHasPermission(false)
      return false
    }
  }, [])

  // リスニング開始
  const startListening = useCallback(async () => {
    if (!streamRef.current) {
      const granted = await requestPermission()
      if (!granted) return
    }

    try {
      // AudioContextの作成
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256

      // マイク入力を接続
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(streamRef.current!)
      microphoneRef.current.connect(analyserRef.current)

      setIsListening(true)

      // 音声レベルの監視
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)

      const checkAudioLevel = () => {
        if (!analyserRef.current) return

        analyserRef.current.getByteFrequencyData(dataArray)

        // 平均音量を計算
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
        const normalizedLevel = average / 255

        setAudioLevel(normalizedLevel)

        // しきい値を超えたら吹き検出
        if (normalizedLevel > threshold && onBlowDetected) {
          onBlowDetected()
        }

        animationFrameRef.current = requestAnimationFrame(checkAudioLevel)
      }

      checkAudioLevel()
    } catch (error) {
      console.error('リスニング開始エラー:', error)
      setIsListening(false)
    }
  }, [onBlowDetected, requestPermission, threshold])

  // リスニング停止
  const stopListening = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    if (microphoneRef.current) {
      microphoneRef.current.disconnect()
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }

    setIsListening(false)
    setAudioLevel(0)
  }, [])

  // クリーンアップ
  useEffect(() => {
    return () => {
      stopListening()
    }
  }, [stopListening])

  return {
    isListening,
    hasPermission,
    audioLevel,
    requestPermission,
    startListening,
    stopListening,
  }
}
