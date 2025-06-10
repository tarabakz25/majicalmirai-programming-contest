import { useEffect, useCallback } from 'react'
import { GameConfig } from '@/types/game'

interface KeyBinding {
  lane0: string
  lane1: string
  lane2: string
  lane3: string
}

export const useKeyInput = (
  keyBinding: KeyBinding,
  onKeyPress: (lane: number) => void
) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // キーリピートを防ぐ
    if (event.repeat) return

    const key = event.key.toLowerCase()
    
    // レーンとキーのマッピング
    const keyToLane: Record<string, number> = {
      [keyBinding.lane0.toLowerCase()]: 0,
      [keyBinding.lane1.toLowerCase()]: 1,
      [keyBinding.lane2.toLowerCase()]: 2,
      [keyBinding.lane3.toLowerCase()]: 3,
    }

    const lane = keyToLane[key]
    if (lane !== undefined) {
      event.preventDefault()
      onKeyPress(lane)
    }
  }, [keyBinding, onKeyPress])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  // タッチ入力対応（モバイル用）
  const handleTouchLane = useCallback((lane: number) => {
    onKeyPress(lane)
  }, [onKeyPress])

  return {
    handleTouchLane,
  }
}
