'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'birthday_user_name'

export function useUserName() {
  const [userName, setUserNameState] = useState<string>('')
  const [isLoaded, setIsLoaded] = useState(false)

  // マウント時にlocalStorageから読み込み
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setUserNameState(stored)
      }
      setIsLoaded(true)
    })
    return () => cancelAnimationFrame(raf)
  }, [])

  // localStorageに保存
  const setUserName = useCallback((name: string) => {
    const trimmed = name.trim()
    if (trimmed) {
      localStorage.setItem(STORAGE_KEY, trimmed)
      setUserNameState(trimmed)
    }
  }, [])

  // 保存された名前をクリア
  const clearUserName = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setUserNameState('')
  }, [])

  return {
    userName,
    setUserName,
    clearUserName,
    isLoaded,
    hasUserName: !!userName,
  }
}
