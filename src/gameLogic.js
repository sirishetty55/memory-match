export const DIFFICULTY_SETTINGS = {
  easy: { label: 'Easy', rows: 4, cols: 4, pairs: 8, multiplier: 1 },
  medium: { label: 'Medium', rows: 4, cols: 5, pairs: 10, multiplier: 1.45 },
  hard: { label: 'Hard', rows: 6, cols: 6, pairs: 18, multiplier: 2.2 },
}

export const THEMES = {
  emoji: {
    name: 'Emoji',
    items: ['🐶', '🐱', '🦊', '🐼', '🐻', '🐸', '🦄', '🐙', '🍉', '🍇', '🍓', '🍒', '🚀', '🎈', '⭐', '🪐', '☀️', '🌙', '🎁', '🎧'],
  },
  space: {
    name: 'Space',
    items: ['🪐', '🌙', '☄️', '🚀', '⭐', '🌠', '🛰️', '👩‍🚀', '🛸', '🌌', '⚡', '☀️', '🪐', '🌑', '💫', '🌍', '🌙', '🪐'],
  },
  animals: {
    name: 'Animals',
    items: ['🐶', '🐱', '🦊', '🐼', '🐻', '🐸', '🦁', '🐯', '🐵', '🐨', '🐰', '🦄', '🐮', '🐷', '🐹', '🐔', '🦉', '🐧', '🐠', '🐢'],
  },
  cute: {
    name: 'Fun / Cute',
    items: ['🌈', '🎈', '🍭', '🍬', '🧁', '🍦', '☁️', '⭐', '💖', '✨', '🌟', '🎀', '🦋', '🍓', '💫', '🎁', '🎀', '🌸', '🩷', '🐚'],
  },
}

export function shuffleArray(items) {
  const array = [...items]
  for (let index = array.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[array[index], array[swapIndex]] = [array[swapIndex], array[index]]
  }
  return array
}

export function createDeck(themeKey, difficultyKey) {
  const settings = DIFFICULTY_SETTINGS[difficultyKey]
  const theme = THEMES[themeKey] || THEMES.emoji
  const items = theme.items.slice(0, settings.pairs)
  const deck = items.flatMap((symbol, index) => [
    { id: `${symbol}-${index}-a`, symbol, matched: false, revealed: false },
    { id: `${symbol}-${index}-b`, symbol, matched: false, revealed: false },
  ])

  return shuffleArray(deck)
}

export function formatTime(totalSeconds) {
  const safeTotal = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(safeTotal / 60)
  const seconds = safeTotal % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function getAccuracy(matchedPairs, totalMoves) {
  if (totalMoves === 0) return 0
  return Math.min(100, Math.round((matchedPairs / totalMoves) * 100))
}

export function calculateScore({ difficulty, moves, seconds, accuracy }) {
  const difficultyMultiplier = DIFFICULTY_SETTINGS[difficulty]?.multiplier ?? 1
  const movePenalty = Math.max(0, moves - 8) * 50
  const timeBonus = Math.max(0, 240 - seconds) * 2
  const accuracyBonus = Math.max(0, accuracy) * 15
  return Math.max(0, Math.round((1200 * difficultyMultiplier) + accuracyBonus + timeBonus - movePenalty))
}

export function isNewBestRecord(current, previous) {
  return (current?.score ?? 0) > (previous?.score ?? 0)
}
