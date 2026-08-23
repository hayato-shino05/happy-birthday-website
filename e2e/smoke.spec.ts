import { expect, test } from '@playwright/test'

// Supabase REST をモック（本番データ・本番書き込み不使用）
const MOCK_MESSAGES = [
  { id: 1, sender: 'モック太郎', message: 'モック送信テスト', birthday_person: null, media_object_path: null, created_at: new Date().toISOString() },
]

async function mockSupabaseRest(page: import('@playwright/test').Page, onPost?: (body: string) => void, withBroad = true) {
  // 広域ハンドラを先に、messages 固有を後に登録（Playwright は後登録が優先）
  if (withBroad) {
    await page.route('**/rest/v1/**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    )
  }
  await page.route('**/rest/v1/messages**', async (route) => {
    if (route.request().method() === 'POST') {
      onPost?.(route.request().postData() ?? '')
      return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(MOCK_MESSAGES[0]) })
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_MESSAGES) })
  })
}

test.describe('home shell smoke', () => {
  test.beforeEach(async ({ page }) => {
    await mockSupabaseRest(page)
  })

  test('mobile 390x844 has no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(overflow).toBe(false)
  })

  test('reduced-motion hides background video', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' })
    const page = await context.newPage()
    await mockSupabaseRest(page)
    await page.goto('/')
    await expect(page.locator('video')).toHaveCount(0)
    await context.close()
  })

  test('album dialog opens with focus and closes on Escape', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /VIEW MEMORY ALBUM|思い出アルバム/ }).first().click()
    const dialog = page.locator('[role="dialog"]').first()
    await expect(dialog).toBeVisible()
    await expect(dialog.locator(':focus')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()
  })

  test('anonymous message POST flows through mocked REST and closes the form', async ({ page }) => {
    await page.goto('/')
    const postRequestPromise = page.waitForRequest(
      (r) => r.method() === 'POST' && r.url().includes('/rest/v1/messages'),
    )
    await page.getByRole('button', { name: /SEND WISHES|お祝いメッセージ/ }).first().click()
    const form = page.locator('form').filter({ has: page.getByRole('button', { name: /Send your wish|お祝いを送る/ }) }).first()
    await form.getByRole('textbox', { name: /Your name|あなたの名前/ }).fill('モック太郎')
    await form.getByRole('textbox', { name: /Type a message|メッセージを入力/ }).fill('モック送信テスト')
    await form.getByRole('button', { name: /Send your wish|お祝いを送る/ }).click()

    // 成功時は onSuccess でモーダルが閉じる（成功コピーはフォーム内に表示されない設計）
    const post = await postRequestPromise
    expect(post.postData()).toContain('モック送信テスト')
    await expect(form).not.toBeVisible()
    await page.screenshot({ path: 'tmp/browser-smoke/anon-post-success.png', fullPage: true })
  })

  test('camera capture exposes dialog semantics and Escape closes it', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /SEND WISHES|お祝いメッセージ/ }).first().click()
    await page.getByRole('button', { name: /Record Video|ビデオを撮る/ }).first().click()
    const captureDialog = page.getByRole('dialog', { name: /Record Video|ビデオを撮る/ })
    await expect(captureDialog).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(captureDialog).not.toBeVisible()
  })
})
