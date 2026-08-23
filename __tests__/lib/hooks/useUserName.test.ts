import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useUserName } from '@/lib/hooks/useUserName'

describe('useUserName', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('initializes with stored value and isLoaded is true on client', () => {
    localStorage.setItem('birthday_user_name', '花子')
    const { result } = renderHook(() => useUserName())

    expect(result.current.userName).toBe('花子')
    expect(result.current.hasUserName).toBe(true)
    expect(result.current.isLoaded).toBe(true)
  })

  it('updates userName and persists to localStorage via setUserName', () => {
    const { result } = renderHook(() => useUserName())

    act(() => {
      result.current.setUserName('太郎')
    })

    expect(result.current.userName).toBe('太郎')
    expect(result.current.hasUserName).toBe(true)
    expect(localStorage.getItem('birthday_user_name')).toBe('太郎')
  })

  it('clears userName and localStorage via clearUserName', () => {
    localStorage.setItem('birthday_user_name', '花子')
    const { result } = renderHook(() => useUserName())

    act(() => {
      result.current.clearUserName()
    })

    expect(result.current.userName).toBe('')
    expect(result.current.hasUserName).toBe(false)
    expect(localStorage.getItem('birthday_user_name')).toBeNull()
  })

  it('updates userName on subsequent storage event even after setUserName in same tab', () => {
    const { result } = renderHook(() => useUserName())

    act(() => {
      result.current.setUserName('ローカル太郎')
    })
    expect(result.current.userName).toBe('ローカル太郎')

    act(() => {
      localStorage.setItem('birthday_user_name', '別タブ次郎')
      window.dispatchEvent(new StorageEvent('storage', { key: 'birthday_user_name', newValue: '別タブ次郎' }))
    })

    expect(result.current.userName).toBe('別タブ次郎')
  })
})
