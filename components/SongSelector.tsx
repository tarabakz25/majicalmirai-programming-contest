"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { StorageManager } from '@/lib/storage'
import { ScoreRecord } from '@/types/game'

interface SongInfo {
  id: string
  title: string
  artist: string
  url: string
  difficulty: {
    easy: number
    normal: number
    hard: number
  }
}

interface SongSelectorProps {
  songs: SongInfo[]
}

export const SongSelector: React.FC<SongSelectorProps> = ({ songs }) => {
  const router = useRouter()
  const [selectedSong, setSelectedSong] = useState<SongInfo | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal')
  const [bestScores, setBestScores] = useState<Record<string, ScoreRecord>>({})

  useEffect(() => {
    // ベストスコアの読み込み
    const scores = StorageManager.loadScores()
    const best: Record<string, ScoreRecord> = {}
    
    scores.forEach(score => {
      if (!best[score.songId] || score.score > best[score.songId].score) {
        best[score.songId] = score
      }
    })
    
    setBestScores(best)
  }, [])

  const handleSongSelect = (song: SongInfo) => {
    setSelectedSong(song)
  }

  const handlePlay = () => {
    if (!selectedSong) return
    
    // 難易度設定を保存
    const config = StorageManager.loadConfig()
    StorageManager.saveConfig({
      ...config,
      // 難易度に応じた設定調整は後で実装
    })
    
    // プレイ画面へ遷移
    const songId = selectedSong.url.split('/').pop()?.split('?')[0] || selectedSong.id
    router.push(`/play/${songId}`)
  }

  const formatScore = (score: number) => {
    return score.toLocaleString()
  }

  const getRank = (accuracy: number) => {
    if (accuracy >= 0.95) return { rank: 'S', color: 'text-yellow-400' }
    if (accuracy >= 0.90) return { rank: 'A', color: 'text-green-400' }
    if (accuracy >= 0.80) return { rank: 'B', color: 'text-blue-400' }
    if (accuracy >= 0.70) return { rank: 'C', color: 'text-purple-400' }
    return { rank: 'D', color: 'text-red-400' }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400'
      case 'normal': return 'text-yellow-400'
      case 'hard': return 'text-red-400'
      default: return 'text-white'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-blue-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">SONG SELECT</h1>
          <p className="text-gray-300">楽曲を選択してください</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 楽曲リスト */}
          <div className="lg:col-span-2">
            <div className="grid gap-4">
              {songs.map((song, index) => {
                const bestScore = bestScores[song.id]
                const isSelected = selectedSong?.id === song.id
                
                return (
                  <div
                    key={song.id}
                    onClick={() => handleSongSelect(song)}
                    className={`
                      bg-black bg-opacity-50 rounded-lg p-4 cursor-pointer transition-all
                      ${isSelected 
                        ? 'ring-2 ring-blue-400 bg-opacity-70' 
                        : 'hover:bg-opacity-70'
                      }
                    `}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg">
                          {song.title || `楽曲 ${index + 1}`}
                        </h3>
                        <p className="text-gray-300">{song.artist}</p>
                        
                        {/* 難易度表示 */}
                        <div className="flex space-x-2 mt-2">
                          <span className="text-green-400">EASY: {song.difficulty.easy}</span>
                          <span className="text-yellow-400">NORMAL: {song.difficulty.normal}</span>
                          <span className="text-red-400">HARD: {song.difficulty.hard}</span>
                        </div>
                      </div>
                      
                      {/* ベストスコア */}
                      {bestScore && (
                        <div className="text-right">
                          <div className="text-white font-bold">
                            {formatScore(bestScore.score)}
                          </div>
                          <div className={`font-bold ${getRank(bestScore.accuracy).color}`}>
                            {getRank(bestScore.accuracy).rank}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 選択パネル */}
          <div className="lg:col-span-1">
            <div className="bg-black bg-opacity-50 rounded-lg p-6 sticky top-8">
              {selectedSong ? (
                <>
                  <h3 className="text-white font-bold text-xl mb-4">
                    {selectedSong.title || '選択された楽曲'}
                  </h3>
                  
                  {/* 難易度選択 */}
                  <div className="mb-6">
                    <label className="block text-white font-bold mb-2">難易度</label>
                    <div className="space-y-2">
                      {(['easy', 'normal', 'hard'] as const).map(diff => (
                        <label key={diff} className="flex items-center">
                          <input
                            type="radio"
                            name="difficulty"
                            value={diff}
                            checked={selectedDifficulty === diff}
                            onChange={(e) => setSelectedDifficulty(e.target.value as any)}
                            className="mr-2"
                          />
                          <span className={`capitalize ${getDifficultyColor(diff)}`}>
                            {diff} ({selectedSong.difficulty[diff]})
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* ベストスコア表示 */}
                  {bestScores[selectedSong.id] && (
                    <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                      <h4 className="text-white font-bold mb-2">BEST SCORE</h4>
                      <div className="text-yellow-400 font-bold text-lg">
                        {formatScore(bestScores[selectedSong.id].score)}
                      </div>
                      <div className="text-gray-300">
                        {(bestScores[selectedSong.id].accuracy * 100).toFixed(1)}% - {getRank(bestScores[selectedSong.id].accuracy).rank}
                      </div>
                    </div>
                  )}

                  {/* プレイボタン */}
                  <button
                    onClick={handlePlay}
                    className="w-full px-6 py-4 bg-green-500 text-white font-bold text-lg rounded-lg hover:bg-green-600 transition-colors"
                  >
                    PLAY
                  </button>
                </>
              ) : (
                <div className="text-center text-gray-400">
                  <p>楽曲を選択してください</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
