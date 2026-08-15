import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import {
  DIFFICULTY_SETTINGS,
  THEMES,
  calculateScore,
  createDeck,
  formatTime,
  getAccuracy,
} from './gameLogic'

const STORAGE_KEY = 'memory-game-state-v1'

function getDefaultPreferences() {
  return {
    theme: 'emoji',
    soundOn: true,
    difficulty: 'easy',
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {
        bestScores: {},
        bestTimes: {},
        fewestMoves: {},
        stats: {
          gamesPlayed: 0,
          gamesCompleted: 0,
          totalScore: 0,
          totalTime: 0,
        },
        preferences: getDefaultPreferences(),
      }
    }

    const parsed = JSON.parse(raw)
    return {
      bestScores: parsed.bestScores ?? {},
      bestTimes: parsed.bestTimes ?? {},
      fewestMoves: parsed.fewestMoves ?? {},
      stats: parsed.stats ?? {
        gamesPlayed: 0,
        gamesCompleted: 0,
        totalScore: 0,
        totalTime: 0,
      },
      preferences: { ...getDefaultPreferences(), ...(parsed.preferences ?? {}) },
    }
  } catch {
    return {
      bestScores: {},
      bestTimes: {},
      fewestMoves: {},
      stats: {
        gamesPlayed: 0,
        gamesCompleted: 0,
        totalScore: 0,
        totalTime: 0,
      },
      preferences: getDefaultPreferences(),
    }
  }
}

function App() {
  const savedState = useRef(loadState())
  const [theme, setTheme] = useState(savedState.current.preferences.theme)
  const [soundOn, setSoundOn] = useState(savedState.current.preferences.soundOn)
  const [difficulty, setDifficulty] = useState(savedState.current.preferences.difficulty)
  const [deck, setDeck] = useState(() => createDeck(savedState.current.preferences.theme, savedState.current.preferences.difficulty))
  const [selected, setSelected] = useState([])
  const [matchedCount, setMatchedCount] = useState(0)
  const [moves, setMoves] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [started, setStarted] = useState(false)
  const [isWon, setIsWon] = useState(false)
  const [score, setScore] = useState(0)
  const [bestScores, setBestScores] = useState(savedState.current.bestScores)
  const [bestTimes, setBestTimes] = useState(savedState.current.bestTimes)
  const [fewestMoves, setFewestMoves] = useState(savedState.current.fewestMoves)
  const [stats, setStats] = useState(savedState.current.stats)
  const [lastResult, setLastResult] = useState(null)
  const [showingStats, setShowingStats] = useState(false)

  const settings = DIFFICULTY_SETTINGS[difficulty]
  const totalPairs = settings.pairs
  const accuracy = useMemo(() => getAccuracy(matchedCount, moves), [matchedCount, moves])

  useEffect(() => {
    const state = {
      bestScores,
      bestTimes,
      fewestMoves,
      stats,
      preferences: { theme, soundOn, difficulty },
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [bestScores, bestTimes, fewestMoves, stats, theme, soundOn, difficulty])

  useEffect(() => {
    if (!started || isWon) return undefined
    const timer = window.setInterval(() => {
      setSeconds((current) => current + 1)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [started, isWon])

  useEffect(() => {
    const total = calculateScore({
      difficulty,
      moves,
      seconds,
      accuracy,
    })
    setScore(total)
  }, [accuracy, difficulty, moves, seconds])

  useEffect(() => {
    if (matchedCount !== totalPairs || isWon) return

    setIsWon(true)
    setStarted(false)
    setIsLocked(true)

    const completionStats = {
      score,
      time: seconds,
      moves,
      accuracy,
      difficulty,
    }

    setLastResult(completionStats)

    setStats((current) => ({
      gamesPlayed: current.gamesPlayed ?? 0,
      gamesCompleted: (current.gamesCompleted ?? 0) + 1,
      totalScore: (current.totalScore ?? 0) + score,
      totalTime: (current.totalTime ?? 0) + seconds,
    }))

    setBestScores((current) => {
      const previous = current[difficulty]
      const next = previous == null || score > previous ? score : previous
      return { ...current, [difficulty]: next }
    })

    setBestTimes((current) => {
      const previous = current[difficulty]
      const next = previous == null || seconds < previous ? seconds : previous
      return { ...current, [difficulty]: next }
    })

    setFewestMoves((current) => {
      const previous = current[difficulty]
      const next = previous == null || moves < previous ? moves : previous
      return { ...current, [difficulty]: next }
    })
  }, [matchedCount, totalPairs, isWon, score, seconds, moves, accuracy, difficulty])

  const playTone = (type) => {
    if (!soundOn || typeof window === 'undefined') return

    const AudioContextCtor = window.AudioContext || window.webkitAudioContext
    if (!AudioContextCtor) return

    const audioContext = new AudioContextCtor()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.type = type === 'match' ? 'triangle' : type === 'wrong' ? 'sawtooth' : 'sine'
    oscillator.frequency.value = type === 'match' ? 620 : type === 'wrong' ? 180 : 420
    gainNode.gain.value = 0.04
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    oscillator.start()
    oscillator.stop(audioContext.currentTime + 0.12)
    void audioContext.close()
  }

  const resetBoardState = () => {
    setDeck(createDeck(theme, difficulty))
    setSelected([])
    setMatchedCount(0)
    setMoves(0)
    setSeconds(0)
    setIsLocked(false)
    setStarted(false)
    setIsWon(false)
    setLastResult(null)
    setScore(0)
  }

  const startNewGame = (nextDifficulty = difficulty, nextTheme = theme, countGame = true) => {
    setDifficulty(nextDifficulty)
    setTheme(nextTheme)
    setDeck(createDeck(nextTheme, nextDifficulty))
    setSelected([])
    setMatchedCount(0)
    setMoves(0)
    setSeconds(0)
    setIsLocked(false)
    setStarted(false)
    setIsWon(false)
    setLastResult(null)
    setScore(0)

    if (countGame) {
      setStats((current) => ({
        gamesPlayed: (current.gamesPlayed ?? 0) + 1,
        gamesCompleted: current.gamesCompleted ?? 0,
        totalScore: current.totalScore ?? 0,
        totalTime: current.totalTime ?? 0,
      }))
    }
  }

  const startFreshGame = () => {
    const defaultDifficulty = 'easy'
    const defaultTheme = 'emoji'
    startNewGame(defaultDifficulty, defaultTheme, true)
  }

  const restartCurrentGame = () => {
    resetBoardState()
  }

  const handleDifficultyChange = (nextDifficulty) => {
    setDifficulty(nextDifficulty)
    setDeck(createDeck(theme, nextDifficulty))
    setSelected([])
    setMatchedCount(0)
    setMoves(0)
    setSeconds(0)
    setIsLocked(false)
    setStarted(false)
    setIsWon(false)
    setLastResult(null)
    setScore(0)
  }

  const handleCardClick = (cardId) => {
    if (isLocked || isWon) return
    const currentCard = deck.find((card) => card.id === cardId)
    if (!currentCard || currentCard.matched || selected.some((entry) => entry.id === cardId)) return

    if (!started) setStarted(true)

    const nextSelected = [...selected, currentCard]
    setSelected(nextSelected)

    if (nextSelected.length === 2) {
      setMoves((current) => current + 1)
      setIsLocked(true)

      const [firstCard, secondCard] = nextSelected
      if (firstCard.symbol === secondCard.symbol) {
        playTone('match')
        window.setTimeout(() => {
          setDeck((currentDeck) =>
            currentDeck.map((card) =>
              card.id === firstCard.id || card.id === secondCard.id
                ? { ...card, matched: true }
                : card,
            ),
          )
          setSelected([])
          setMatchedCount((current) => current + 1)
          setIsLocked(false)
        }, 420)
      } else {
        playTone('wrong')
        window.setTimeout(() => {
          setSelected([])
          setIsLocked(false)
        }, 720)
      }
    }
  }

  const resetStatistics = () => {
    setStats({
      gamesPlayed: 0,
      gamesCompleted: 0,
      totalScore: 0,
      totalTime: 0,
    })
    setBestScores({})
    setBestTimes({})
    setFewestMoves({})
  }

  const averageScore = stats.gamesCompleted ? Math.round((stats.totalScore ?? 0) / stats.gamesCompleted) : 0
  const averageTime = stats.gamesCompleted ? Math.round((stats.totalTime ?? 0) / stats.gamesCompleted) : 0

  return (
    <div className={`app-shell theme-${theme}`}>
      <header className="topbar">
        <div>
          <p className="eyebrow">Memory Match</p>
          <h1>Card Quest</h1>
        </div>
        <div className="topbar-actions">
          <button type="button" className="action-btn" onClick={startFreshGame}>
            New Game
          </button>
          <button type="button" className="action-btn secondary" onClick={restartCurrentGame}>
            Restart
          </button>
        </div>
      </header>

      <main className="game-layout">
        <aside className="sidebar panel">
          <div className="panel-header">
            <h2>Game Setup</h2>
          </div>

          <label className="field-group">
            <span>Difficulty</span>
            <select value={difficulty} onChange={(event) => handleDifficultyChange(event.target.value)}>
              {Object.entries(DIFFICULTY_SETTINGS).map(([key, setting]) => (
                <option key={key} value={key}>{setting.label}</option>
              ))}
            </select>
          </label>

          <label className="field-group">
            <span>Theme</span>
            <select
              value={theme}
              onChange={(event) => {
                const nextTheme = event.target.value
                setTheme(nextTheme)
                setDeck(createDeck(nextTheme, difficulty))
                setSelected([])
                setMatchedCount(0)
                setMoves(0)
                setSeconds(0)
                setIsLocked(false)
                setStarted(false)
                setIsWon(false)
                setLastResult(null)
                setScore(0)
              }}
            >
              {Object.entries(THEMES).map(([key, value]) => (
                <option key={key} value={key}>{value.name}</option>
              ))}
            </select>
          </label>

          <div className="toggle-row">
            <span>Sound</span>
            <button
              type="button"
              className={`toggle ${soundOn ? 'active' : ''}`}
              onClick={() => setSoundOn((current) => !current)}
            >
              {soundOn ? 'On' : 'Off'}
            </button>
          </div>

          <div className="stats-box">
            <h3>Best Records</h3>
            <ul>
              <li><span>Best score</span><strong>{bestScores[difficulty] ?? 0}</strong></li>
              <li><span>Best time</span><strong>{bestTimes[difficulty] != null ? formatTime(bestTimes[difficulty]) : '--:--'}</strong></li>
              <li><span>Fewest moves</span><strong>{fewestMoves[difficulty] ?? '--'}</strong></li>
            </ul>
          </div>

          <div className="sidebar-actions">
            <button type="button" className="action-btn ghost" onClick={() => setShowingStats((current) => !current)}>
              {showingStats ? 'Hide Stats' : 'View Stats'}
            </button>
            <button type="button" className="action-btn ghost danger" onClick={resetStatistics}>
              Reset Stats
            </button>
          </div>
        </aside>

        <section className="game-panel panel">
          <div className="status-bar">
            <div className="stat-pill">
              <span>Time</span>
              <strong>{formatTime(seconds)}</strong>
            </div>
            <div className="stat-pill">
              <span>Moves</span>
              <strong>{moves}</strong>
            </div>
            <div className="stat-pill">
              <span>Pairs</span>
              <strong>{matchedCount}/{totalPairs}</strong>
            </div>
            <div className="stat-pill highlight">
              <span>Score</span>
              <strong>{score}</strong>
            </div>
          </div>

          <div className="board-wrap">
            <div
              className="board"
              style={{
                gridTemplateColumns: `repeat(${settings.cols}, minmax(0, 1fr))`,
              }}
            >
              {deck.map((card) => {
                const isFaceUp = selected.some((entry) => entry.id === card.id) || card.matched
                return (
                  <button
                    key={card.id}
                    type="button"
                    className={`memory-card ${isFaceUp ? 'revealed' : ''} ${card.matched ? 'matched' : ''}`}
                    onClick={() => handleCardClick(card.id)}
                    aria-label={isFaceUp ? `Card ${card.symbol}` : 'Hidden card'}
                  >
                    <span className="card-inner">
                      <span className="card-front">?</span>
                      <span className="card-back">{card.symbol}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        <aside className="sidebar panel right-panel">
          <div className="panel-header">
            <h2>Progress</h2>
          </div>

          <div className="progress-list">
            <div className="mini-stat">
              <span>Accuracy</span>
              <strong>{accuracy}%</strong>
            </div>
            <div className="mini-stat">
              <span>Games played</span>
              <strong>{stats.gamesPlayed ?? 0}</strong>
            </div>
            <div className="mini-stat">
              <span>Completed</span>
              <strong>{stats.gamesCompleted ?? 0}</strong>
            </div>
            <div className="mini-stat">
              <span>Avg score</span>
              <strong>{averageScore}</strong>
            </div>
            <div className="mini-stat">
              <span>Avg time</span>
              <strong>{formatTime(averageTime)}</strong>
            </div>
          </div>

          <div className="legend">
            <p>Objective: find every matching pair while beating your best time and score.</p>
          </div>
        </aside>
      </main>

      {showingStats && (
        <section className="panel stats-panel">
          <h3>Session Statistics</h3>
          <div className="stats-grid">
            <div><span>Games played</span><strong>{stats.gamesPlayed ?? 0}</strong></div>
            <div><span>Games completed</span><strong>{stats.gamesCompleted ?? 0}</strong></div>
            <div><span>Best score</span><strong>{Math.max(0, ...Object.values(bestScores)) || 0}</strong></div>
            <div><span>Best time</span><strong>{Object.values(bestTimes).length ? formatTime(Math.min(...Object.values(bestTimes))) : '--:--'}</strong></div>
            <div><span>Fewest moves</span><strong>{Object.values(fewestMoves).length ? Math.min(...Object.values(fewestMoves)) : '--'}</strong></div>
            <div><span>Average score</span><strong>{averageScore}</strong></div>
            <div><span>Average time</span><strong>{formatTime(averageTime)}</strong></div>
          </div>
        </section>
      )}

      {isWon && (
        <div className="overlay">
          <div className="completion-modal panel">
            <div className="celebration">🎉</div>
            <h2>Congratulations!</h2>
            <p className="modal-summary">
              Time: <strong>{formatTime(seconds)}</strong>
              <span>Moves: <strong>{moves}</strong></span>
              <span>Accuracy: <strong>{accuracy}%</strong></span>
              <span>Score: <strong>{score}</strong></span>
            </p>
            <div className="achievement-row">
              {lastResult && (
                <>
                  {bestScores[difficulty] === score && <span className="badge">New best score</span>}
                  {bestTimes[difficulty] === seconds && <span className="badge">New best time</span>}
                  {fewestMoves[difficulty] === moves && <span className="badge">Fewest moves</span>}
                </>
              )}
            </div>
            <button type="button" className="action-btn" onClick={() => startNewGame()}>
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
