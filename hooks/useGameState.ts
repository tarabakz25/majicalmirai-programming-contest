import { useState, useCallback } from 'react'
import { GameState } from '@/types/game'

const initialGameState: GameState = {
  isPlaying: false,
  isPaused: false,
  currentTime: 0,
  score: 0,
  combo: 0,
  maxCombo: 0,
  accuracy: 0,
  judgments: {
    perfect: 0,
    great: 0,
    good: 0,
    miss: 0,
  },
}

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState)

  const updateGameState = useCallback((newState: GameState) => {
    setGameState(newState)
  }, [])

  const resetGameState = useCallback(() => {
    setGameState(initialGameState)
  }, [])

  return {
    gameState,
    updateGameState,
    resetGameState,
  }
}
