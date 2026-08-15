# Card Quest Memory Match

A polished browser-based memory game built with React and Vite. It includes several difficulty modes, themed card sets, local persistence, stat tracking, responsive UI, and a completion flow designed to feel more like a casual game than a basic demo.

## Features

- Multiple board sizes: Easy (4x4), Medium (5x4), Hard (6x6)
- Theme switching across Emoji, Space, Animals, and Fun / Cute card sets
- Card flips with 3D animation and smooth match / mismatch feedback
- Timer, move counting, accuracy, score, and completion tracking
- Local best-score persistence by difficulty level
- Game stats that persist across browser sessions
- Sound toggle with optional tone-based effects
- Responsive layout for desktop, tablet, and mobile
- Completion modal with celebratory state and replay options

## How the game works

The player flips two cards at a time to find matching pairs. When two cards match, they remain visible and the pair is counted as complete. When they do not match, both cards briefly remain revealed before flipping back, creating a turn-based memory challenge. The game ends when all pairs are matched.

## Difficulty levels

- Easy: 4x4 board, 8 pairs
- Medium: 5x4 board, 10 pairs
- Hard: 6x6 board, 18 pairs

The score and match difficulty scale with the selected board size, while layout remains responsive across screen sizes.

## Scoring system

Score is influenced by:

- Difficulty multiplier
- Number of moves
- Completion time
- Accuracy percentage

The formula rewards efficient play and higher accuracy while penalizing slow or inefficient runs.

## Technologies used

- React
- Vite
- JavaScript
- CSS for responsive layout and animations
- LocalStorage for persistence

## Setup instructions

1. Clone the repository.
2. Open the project folder.
3. Install dependencies:

   npm install

4. Start the dev server:

   npm run dev

5. Open the Vite local URL shown in the terminal.

## Running the project

To run the game in development mode:

npm run dev

To build the production bundle:

npm run build

To run tests:

npm test

## Project structure

src/
- App.jsx — main UI and gameplay flow
- App.css — layout, theme styling, animations, and responsive behavior
- gameLogic.js — deck generation, shuffle logic, difficulty settings, time formatting, and scoring
- gameLogic.test.js — logic verification tests
- index.css — base reset and global styling

## Future improvements

- Additional card themes and artwork packs
- More advanced sound design and music toggle
- Daily challenge or streak-based mode
- Leaderboard integration
- Accessibility improvements and keyboard navigation refinements

## Notes

The application stores best scores, best times, fewest moves, and gameplay statistics in the browser using localStorage so game progress is preserved across refreshes.
