'use client'

import { useCallback, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'birthday_user_name'

const listeners = new Set<() => void>()

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {}
  listeners.add(callback)
  window.addEventListener('storage', callback)
  return () => {
    listeners.delete(callback)
    window.removeEventListener('storage', callback)
  }
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
  const userName = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  // localStorageに保存
  const setUserName = useCallback((name: string) => {
    const trimmed = name.trim()
    if (trimmed) {
      try {
        localStorage.setItem(STORAGE_KEY, trimmed)
      } catch {}
      emitChange()
    }
  }, [])

  // 保存された名前をクリア
  const clearUserName = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
    emitChange()
  }, [])

  return {
    userName,
    setUserName,
    clearUserName,
    isLoaded: mounted,
    hasUserName: !!userName,
  }
}
