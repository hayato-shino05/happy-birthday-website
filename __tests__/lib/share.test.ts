import { describe, expect, it } from 'vitest'
import { buildLineShareUrl } from '@/lib/share'

describe('buildLineShareUrl', () => {
  it('encodes the title, message, and URL as LINE share text', () => {
    expect(buildLineShareUrl('お誕生日！', '一緒にお祝いしよう', 'https://example.test/a?b=c&d=e')).toBe(
      'https://line.me/R/share?text=%E3%81%8A%E8%AA%95%E7%94%9F%E6%97%A5%EF%BC%81%0A%E4%B8%80%E7%B7%92%E3%81%AB%E3%81%8A%E7%A5%9D%E3%81%84%E3%81%97%E3%82%88%E3%81%86%0Ahttps%3A%2F%2Fexample.test%2Fa%3Fb%3Dc%26d%3De',
    )
  })
})
