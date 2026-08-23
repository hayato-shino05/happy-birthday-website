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
  const idx = source.indexOf(identifier)
  expect(idx, `Missing identifier: ${identifier}`).toBeGreaterThanOrEqual(0)
  const tagStart = source.lastIndexOf('<button', idx)
  const tagEnd = source.indexOf('>', idx)
  expect(tagStart, `Cannot find <button start for: ${identifier}`).toBeGreaterThanOrEqual(0)
  expect(tagEnd, `Cannot find > end for: ${identifier}`).toBeGreaterThanOrEqual(0)
  const openingTag = source.slice(tagStart, tagEnd + 1)
  const classMatch = openingTag.match(/className=(?:\{`([^`]+)`\}|"([^"]+)")/)
  expect(classMatch, `Missing className attribute in <button> tag for: ${identifier}`).toBeTruthy()
  return classMatch![1] || classMatch![2] || ''
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
