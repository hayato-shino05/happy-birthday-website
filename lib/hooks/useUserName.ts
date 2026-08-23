'use client'

import { useState, useCallback, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'birthday_user_name'

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener('storage', callback)
  return () => window.removeEventListener('storage', callback)
}

function getSnapshot() {
  if (typeof window === 'undefined') return ''
  try {
    return localStorage.getItem(STORAGE_KEY) || ''
  } catch {
    return ''
  }
}

function getServerSnapshot() {
  return ''
}

export function useUserName() {
  const storedName = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [localOverride, setLocalOverride] = useState<string | null>(null)
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const userName = localOverride !== null ? localOverride : storedName

  // localStorageに保存
  const setUserName = useCallback((name: string) => {
    const trimmed = name.trim()
    if (trimmed) {
      try {
        localStorage.setItem(STORAGE_KEY, trimmed)
      } catch {}
      setLocalOverride(trimmed)
    }
  }, [])

  // 保存された名前をクリア
  const clearUserName = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
    setLocalOverride('')
  }, [])

  return {
    userName,
    setUserName,
    clearUserName,
    isLoaded: mounted,
    hasUserName: !!userName,
  }
}
