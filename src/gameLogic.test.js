import { describe, expect, it } from 'vitest'
import {
  createDeck,
  calculateScore,
  formatTime,
  getAccuracy,
  isNewBestRecord,
} from './gameLogic'

describe('memory game logic', () => {
  it('creates a deck with the correct pair count for a difficulty level', () => {
    const deck = createDeck('emoji', 'easy')
    expect(deck).toHaveLength(16)
    expect(new Set(deck.map((card) => card.symbol)).size).toBe(8)
  })

  it('scores higher on easier and more accurate play', () => {
    const best = calculateScore({ difficulty: 'easy', moves: 8, seconds: 42, accuracy: 75 })
    const harder = calculateScore({ difficulty: 'hard', moves: 18, seconds: 120, accuracy: 72 })
    expect(best).toBeGreaterThan(0)
    expect(harder).toBeGreaterThan(best)
  })

  it('formats time as mm:ss', () => {
    expect(formatTime(0)).toBe('00:00')
    expect(formatTime(65)).toBe('01:05')
    expect(formatTime(3661)).toBe('61:01')
  })

  it('computes accuracy as a percentage', () => {
    expect(getAccuracy(3, 5)).toBe(60)
    expect(getAccuracy(0, 0)).toBe(0)
  })

  it('recognizes a higher score as a new record', () => {
    expect(isNewBestRecord({ score: 5200 }, { score: 5000 })).toBe(true)
    expect(isNewBestRecord({ score: 4500 }, { score: 5000 })).toBe(false)
  })
})
