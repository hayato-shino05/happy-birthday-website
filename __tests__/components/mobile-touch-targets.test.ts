import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// モバイル固定操作群のタッチターゲット（≥44px）をソースレベルで保証する回帰ガード。
// jsdom はレイアウト計算を行わないため、実寸は UI テストではなくこの静的検証で守る。
const source = readFileSync(
  join(process.cwd(), 'components', 'ui', 'MobileBottomDock.tsx'),
  'utf8',
)

function getButtonClassName(identifier: string): string {
  const buttons: Array<{ tag: string; className: string }> = []
  let pos = 0
  while (true) {
    const startIdx = source.indexOf('<button', pos)
    if (startIdx === -1) break

    let endIdx = -1
    let braceDepth = 0
    let inQuote: string | null = null

    for (let i = startIdx + 7; i < source.length; i++) {
      const char = source[i]
      if (inQuote) {
        if (char === inQuote && source[i - 1] !== '\\') {
          inQuote = null
        }
      } else {
        if (char === '"' || char === "'" || char === '`') {
          inQuote = char
        } else if (char === '{') {
          braceDepth++
        } else if (char === '}') {
          braceDepth = Math.max(0, braceDepth - 1)
        } else if (char === '>' && braceDepth === 0) {
          endIdx = i
          break
        }
      }
    }

    if (endIdx !== -1) {
      const tag = source.slice(startIdx, endIdx + 1)
      const classMatch = tag.match(/className=(?:\{`([^`]+)`\}|"([^"]+)")/)
      buttons.push({
        tag,
        className: classMatch ? classMatch[1] || classMatch[2] || '' : '',
      })
      pos = endIdx + 1
    } else {
      pos = startIdx + 7
    }
  }

  const found = buttons.find((btn) => btn.tag.includes(identifier))
  expect(found, `Cannot find <button> opening tag containing identifier: ${identifier}`).toBeTruthy()
  return found!.className
}

describe('mobile fixed controls touch targets (scoped)', () => {
  it('ensures all 5 main bottom dock navigation buttons meet 48px target in className', () => {
    const dockButtons = [
      "openModal('album')",
      "openModal('message')",
      "openModal('bulletin')",
      "openModal('chat')",
      "setShowMenuSheet(!showMenuSheet)",
    ]

    for (const action of dockButtons) {
      const className = getButtonClassName(action)
      expect(className).toMatch(/min-h-\[48px\]/)
      expect(className).toMatch(/min-w-\[50px\]/)
    }
  })

  it('ensures music capsule player controls meet >=44px target in className', () => {
    const selectMusicClass = getButtonClassName('setShowMusicList(!showMusicList)')
    expect(selectMusicClass).toMatch(/min-h-\[44px\]/)

    const transportControls = [
      'onClick={prevTrack}',
      'onClick={toggle}',
      'onClick={nextTrack}',
    ]

    for (const control of transportControls) {
      const className = getButtonClassName(control)
      expect(className).toMatch(/min-h-\[44px\]/)
      expect(className).toMatch(/min-w-\[44px\]/)
    }
  })

  it('ensures sheet close and modal trigger buttons meet >=44px / >=48px target in className', () => {
    const sheetCloseClass = getButtonClassName("aria-label={t('close')}")
    expect(sheetCloseClass).toMatch(/min-h-\[44px\]/)
    expect(sheetCloseClass).toMatch(/min-w-\[44px\]/)

    const sheetActions = [
      "openModal('omikuji')",
      "openModal('flashback')",
      "openModal('quiz')",
      "openModal('memoryGame')",
      "openModal('puzzleGame')",
      "openModal('calendar')",
      "openModal('timeCapsule')",
    ]

    for (const action of sheetActions) {
      const className = getButtonClassName(action)
      expect(className).toMatch(/min-h-\[48px\]/)
    }
  })
})
