import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// モバイル固定操作群のタッチターゲット（≥44px）をソースレベルで保証する回帰ガード。
// jsdom はレイアウト計算を行わないため、実寸は UI テストではなくこの静的検証で守る。
const source = readFileSync(
  join(process.cwd(), 'components', 'ui', 'MobileBottomDock.tsx'),
  'utf8',
)

describe('mobile fixed controls touch targets (scoped)', () => {
  it('ensures all 5 main bottom dock navigation buttons meet 48px target', () => {
    const dockButtons = [
      "openModal('album')",
      "openModal('message')",
      "openModal('bulletin')",
      "openModal('chat')",
      "setShowMenuSheet(!showMenuSheet)",
    ]

    for (const action of dockButtons) {
      const idx = source.indexOf(action)
      expect(idx, `Missing dock action: ${action}`).toBeGreaterThanOrEqual(0)
      const buttonStart = source.lastIndexOf('<button', idx)
      const buttonEnd = source.indexOf('</button>', idx)
      const buttonChunk = source.slice(buttonStart, buttonEnd + 9)
      expect(buttonChunk).toMatch(/min-h-\[48px\]/)
      expect(buttonChunk).toMatch(/min-w-\[50px\]/)
    }
  })

  it('ensures music capsule player controls meet >=44px target', () => {
    const musicControls = [
      "aria-label={t('selectMusic')}",
      "aria-label={t('previousTrack')}",
      "aria-label={isPlaying ? t('pause') : t('play')}",
      "aria-label={t('nextTrack')}",
    ]

    for (const label of musicControls) {
      const idx = source.indexOf(label)
      expect(idx, `Missing player control: ${label}`).toBeGreaterThanOrEqual(0)
      const buttonStart = source.lastIndexOf('<button', idx)
      const buttonEnd = source.indexOf('</button>', idx)
      const buttonChunk = source.slice(buttonStart, buttonEnd + 9)
      expect(buttonChunk).toMatch(/min-h-\[44px\]/)
    }
  })

  it('ensures sheet close and modal trigger buttons meet >=44px / >=48px target', () => {
    const sheetCloseIdx = source.indexOf("aria-label={t('close')}")
    expect(sheetCloseIdx).toBeGreaterThanOrEqual(0)
    const closeStart = source.lastIndexOf('<button', sheetCloseIdx)
    const closeEnd = source.indexOf('</button>', sheetCloseIdx)
    const closeChunk = source.slice(closeStart, closeEnd + 9)
    expect(closeChunk).toMatch(/min-h-\[44px\]/)
    expect(closeChunk).toMatch(/min-w-\[44px\]/)

    const sheetActions = [
      "openModal('omikuji')",
      "openModal('flashback')",
      "openModal('quiz')",
      "openModal('memoryGame')",
      "openModal('puzzleGame')",
      "openModal('calendar')",
    ]

    for (const action of sheetActions) {
      const idx = source.indexOf(action)
      expect(idx, `Missing sheet action: ${action}`).toBeGreaterThanOrEqual(0)
      const buttonStart = source.lastIndexOf('<button', idx)
      const buttonEnd = source.indexOf('</button>', idx)
      const buttonChunk = source.slice(buttonStart, buttonEnd + 9)
      expect(buttonChunk).toMatch(/min-h-\[48px\]/)
    }
  })
})
