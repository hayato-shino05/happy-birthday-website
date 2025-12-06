'use client'

import { useEffect, useCallback } from 'react'

type KeyCombo = string // 例: 'ctrl+s', 'shift+enter', 'escape'

interface ShortcutConfig {
  key: KeyCombo
  callback: () => void
  description?: string
  preventDefault?: boolean
  enabled?: boolean
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        if (shortcut.enabled === false) continue

        const keys = shortcut.key.toLowerCase().split('+')
        const mainKey = keys[keys.length - 1]
        const modifiers = keys.slice(0, -1)

        const ctrlRequired = modifiers.includes('ctrl') || modifiers.includes('cmd')
        const shiftRequired = modifiers.includes('shift')
        const altRequired = modifiers.includes('alt')

        const ctrlPressed = event.ctrlKey || event.metaKey
        const shiftPressed = event.shiftKey
        const altPressed = event.altKey

        const keyMatches =
          event.key.toLowerCase() === mainKey ||
          event.code.toLowerCase() === mainKey ||
          event.code.toLowerCase() === `key${mainKey}`

        if (
          keyMatches &&
          ctrlPressed === ctrlRequired &&
          shiftPressed === shiftRequired &&
          altPressed === altRequired
        ) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault()
          }
          shortcut.callback()
          break
        }
      }
    },
    [shortcuts]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

// 共通ショートカット用フック
export function useCommonShortcuts({
  onSave,
  onUndo,
  onRedo,
  onSearch,
  onEscape,
  onEnter,
}: {
  onSave?: () => void
  onUndo?: () => void
  onRedo?: () => void
  onSearch?: () => void
  onEscape?: () => void
  onEnter?: () => void
}) {
  const shortcuts: ShortcutConfig[] = []

  if (onSave) {
    shortcuts.push({ key: 'ctrl+s', callback: onSave, description: 'Save' })
  }
  if (onUndo) {
    shortcuts.push({ key: 'ctrl+z', callback: onUndo, description: 'Undo' })
  }
  if (onRedo) {
    shortcuts.push({ key: 'ctrl+shift+z', callback: onRedo, description: 'Redo' })
  }
  if (onSearch) {
    shortcuts.push({ key: 'ctrl+k', callback: onSearch, description: 'Search' })
  }
  if (onEscape) {
    shortcuts.push({ key: 'escape', callback: onEscape, description: 'Close' })
  }
  if (onEnter) {
    shortcuts.push({ key: 'enter', callback: onEnter, description: 'Confirm', preventDefault: false })
  }

  useKeyboardShortcuts(shortcuts)
}

// 矢印キー用ナビゲーションフック
export function useArrowNavigation({
  onUp,
  onDown,
  onLeft,
  onRight,
  enabled = true,
}: {
  onUp?: () => void
  onDown?: () => void
  onLeft?: () => void
  onRight?: () => void
  enabled?: boolean
}) {
  const shortcuts: ShortcutConfig[] = []

  if (onUp) shortcuts.push({ key: 'arrowup', callback: onUp, enabled })
  if (onDown) shortcuts.push({ key: 'arrowdown', callback: onDown, enabled })
  if (onLeft) shortcuts.push({ key: 'arrowleft', callback: onLeft, enabled })
  if (onRight) shortcuts.push({ key: 'arrowright', callback: onRight, enabled })

  useKeyboardShortcuts(shortcuts)
}
