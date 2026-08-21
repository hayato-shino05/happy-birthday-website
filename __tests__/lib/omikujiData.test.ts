import { describe, it, expect } from 'vitest'
import { OMIKUJI_DATA } from '@/data/omikujiData'

describe('OMIKUJI_DATA Dataset', () => {
  it('should contain exactly 12 unique fortune records', () => {
    expect(OMIKUJI_DATA).toHaveLength(12)
    const ids = OMIKUJI_DATA.map((d) => d.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(12)
  })

  it('should have valid fortune ranks and localized names', () => {
    const validRanks = ['daikichi', 'chukichi', 'shokichi', 'kichi', 'suekichi', 'hankichi']
    OMIKUJI_DATA.forEach((fortune) => {
      expect(validRanks).toContain(fortune.rank)
      expect(fortune.rankNameJa.length).toBeGreaterThan(0)
      expect(fortune.rankNameEn.length).toBeGreaterThan(0)
      expect(fortune.poemJa.length).toBeGreaterThan(0)
      expect(fortune.poemEn.length).toBeGreaterThan(0)
      expect(fortune.generalJa.length).toBeGreaterThan(0)
      expect(fortune.generalEn.length).toBeGreaterThan(0)
    })
  })

  it('should have 4 major categories (Bond, Health, Wish, Blessing)', () => {
    OMIKUJI_DATA.forEach((fortune) => {
      expect(fortune.bondJa).toBeDefined()
      expect(fortune.bondEn).toBeDefined()
      expect(fortune.healthJa).toBeDefined()
      expect(fortune.healthEn).toBeDefined()
      expect(fortune.wishJa).toBeDefined()
      expect(fortune.wishEn).toBeDefined()
      expect(fortune.blessingJa).toBeDefined()
      expect(fortune.blessingEn).toBeDefined()
      expect(fortune.luckyNumber).toBeGreaterThan(0)
    })
  })
})
