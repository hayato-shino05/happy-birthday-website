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

  it('ensures fixed navigation controls have sufficient touch target sizing', () => {
    // 固定ドックおよびコントロールボタンに min-h-[44px] または min-h-[48px] が設定されていることを検証
    const touchTargetClasses = source.match(/min-h-\[(?:44|48)px\]/g) ?? []
    expect(touchTargetClasses.length).toBeGreaterThanOrEqual(8)
  })
})
