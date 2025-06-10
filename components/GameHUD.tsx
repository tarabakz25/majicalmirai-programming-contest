import React from 'react'
import { GameState } from '@/types/game'

interface GameHUDProps {
  gameState: GameState
  onPause: () => void
  onResume: () => void
  progress: number
}

export const GameHUD: React.FC<GameHUDProps> = ({
  gameState,
  onPause,
  onResume,
  progress,
}) => {
  const formatScore = (score: number) => {
    return score.toLocaleString()
  }

  const formatAccuracy = (accuracy: number) => {
    return `${(accuracy * 100).toFixed(1)}%`
  }

  return (
    <div className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-50 text-white p-4">
      <div className="flex justify-between items-center">
        {/* 左側: スコア情報 */}
        <div className="flex space-x-6">
          <div className="text-center">
            <div className="text-sm text-gray-300">SCORE</div>
            <div className="text-2xl font-bold">{formatScore(gameState.score)}</div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-gray-300">COMBO</div>
            <div className="text-xl font-bold text-yellow-400">{gameState.combo}</div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-gray-300">ACCURACY</div>
            <div className="text-lg font-bold text-green-400">{formatAccuracy(gameState.accuracy)}</div>
          </div>
        </div>

        {/* 中央: 進行度バー */}
        <div className="flex-1 mx-8">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-100"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>

        {/* 右側: 判定カウント */}
        <div className="flex space-x-4 text-sm">
          <div className="text-center">
            <div className="text-yellow-300">PERFECT</div>
            <div className="font-bold">{gameState.judgments.perfect}</div>
          </div>
          <div className="text-center">
            <div className="text-green-300">GREAT</div>
            <div className="font-bold">{gameState.judgments.great}</div>
          </div>
          <div className="text-center">
            <div className="text-blue-300">GOOD</div>
            <div className="font-bold">{gameState.judgments.good}</div>
          </div>
          <div className="text-center">
            <div className="text-red-300">MISS</div>
            <div className="font-bold">{gameState.judgments.miss}</div>
          </div>
        </div>

        {/* 一時停止ボタン */}
        <div className="ml-4">
          {gameState.isPlaying ? (
            <button
              onClick={onPause}
              className="px-4 py-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-600 transition-colors"
            >
              ⏸️ PAUSE
            </button>
          ) : gameState.isPaused ? (
            <button
              onClick={onResume}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              ▶️ RESUME
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
