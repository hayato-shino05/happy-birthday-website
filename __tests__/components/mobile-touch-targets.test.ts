import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// モバイル固定操作群のタッチターゲット（≥44px）をソースレベルで保証する回帰ガード。
// jsdom はレイアウト計算を行わないため、実寸は UI テストではなくこの静的検証で守る。
const source = readFileSync(
  join(process.cwd(), 'components', 'ui', 'MobileBottomDock.tsx'),
  'utf8',
)

describe('mobile fixed controls touch targets', () => {
  it('keeps the raised 44px hit-area classes', () => {
    const hits = source.match(/min-(?:w|h)-\[44px\]|min-h-\[48px\]|min-w-\[50px\]/g) ?? []
    // ドック5ボタン＋カプセル3＋シートClose＋シェア5 の最低ライン
    expect(hits.length).toBeGreaterThanOrEqual(12)
  })

  it('does not attach legacy small sizes to labelled interactive elements', () => {
    const offenders = source.split('\n').filter(
      (line) => /aria-label=/.test(line) && /\bw-[6789] h-[6789]\b/.test(line),
    )
    expect(offenders).toEqual([])
  })
})
