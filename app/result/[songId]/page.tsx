"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { StorageManager } from '@/lib/storage'
import { ScoreRecord } from '@/types/game'
import { songList } from '@/data/songs'

// 静的エクスポート用のパラメータ生成
export async function generateStaticParams() {
  return songList.map((song) => ({
    songId: song.songUrl.split('/').pop()?.split('?')[0] || song.songUrl,
  }))
}

export default function ResultPage() {
  const params = useParams()
  const router = useRouter()
  const songId = params.songId as string
  
  const [scoreRecord, setScoreRecord] = useState<ScoreRecord | null>(null)
  const [bestScore, setBestScore] = useState<ScoreRecord | null>(null)
  const [isNewRecord, setIsNewRecord] = useState(false)

  // 楽曲情報の取得
  const songConfig = songList.find(song => 
    song.songUrl.includes(songId) || song.songUrl.split('/').pop()?.includes(songId)
  )

  useEffect(() => {
    // 最新スコアの取得
    const scores = StorageManager.loadScores()
    const songScores = scores.filter(s => s.songId === songId)
    
    if (songScores.length > 0) {
      const latestScore = songScores.sort((a, b) => b.timestamp - a.timestamp)[0]
      setScoreRecord(latestScore)
      
      // ベストスコアの取得
      const best = songScores.reduce((prev, current) => 
        current.score > prev.score ? current : prev
      )
      setBestScore(best)
      
      // 新記録判定
      setIsNewRecord(latestScore.score === best.score && songScores.length > 1)
    }
  }, [songId])

  const formatScore = (score: number) => {
    return score.toLocaleString()
  }

  const formatAccuracy = (accuracy: number) => {
    return `${(accuracy * 100).toFixed(1)}%`
  }

  const getRank = (accuracy: number) => {
    if (accuracy >= 0.95) return { rank: 'S', color: 'text-yellow-400' }
    if (accuracy >= 0.90) return { rank: 'A', color: 'text-green-400' }
    if (accuracy >= 0.80) return { rank: 'B', color: 'text-blue-400' }
    if (accuracy >= 0.70) return { rank: 'C', color: 'text-purple-400' }
    return { rank: 'D', color: 'text-red-400' }
  }

  if (!scoreRecord) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-900 to-blue-900">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">スコアが見つかりません</h1>
          <button 
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    )
  }

  const { rank, color } = getRank(scoreRecord.accuracy)

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-black bg-opacity-50 rounded-lg p-8 max-w-2xl w-full text-white">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">RESULT</h1>
          {songConfig && (
            <p className="text-lg text-gray-300">
              {songConfig.songUrl.split('/').pop()?.split('?')[0] || 'Unknown Song'}
            </p>
          )}
          {isNewRecord && (
            <div className="mt-2 text-yellow-400 font-bold text-xl animate-pulse">
              🎉 NEW RECORD! 🎉
            </div>
          )}
        </div>

        {/* メインスコア */}
        <div className="text-center mb-8">
          <div className="text-6xl font-bold mb-4">{formatScore(scoreRecord.score)}</div>
          <div className="flex justify-center items-center space-x-4">
            <div className={`text-4xl font-bold ${color}`}>{rank}</div>
            <div className="text-2xl">{formatAccuracy(scoreRecord.accuracy)}</div>
          </div>
        </div>

        {/* 詳細統計 */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="text-center">
            <div className="text-sm text-gray-300">MAX COMBO</div>
            <div className="text-2xl font-bold text-yellow-400">{scoreRecord.maxCombo}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-300">LYRICS SYNC</div>
            <div className="text-2xl font-bold text-green-400">
              {formatAccuracy(scoreRecord.lyricsSync)}
            </div>
          </div>
        </div>

        {/* 判定詳細 */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="text-center">
            <div className="text-sm text-yellow-300">PERFECT</div>
            <div className="text-xl font-bold">{scoreRecord.judgments.perfect}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-green-300">GREAT</div>
            <div className="text-xl font-bold">{scoreRecord.judgments.great}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-blue-300">GOOD</div>
            <div className="text-xl font-bold">{scoreRecord.judgments.good}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-red-300">MISS</div>
            <div className="text-xl font-bold">{scoreRecord.judgments.miss}</div>
          </div>
        </div>

        {/* ベストスコア比較 */}
        {bestScore && bestScore.score !== scoreRecord.score && (
          <div className="bg-gray-800 rounded-lg p-4 mb-8">
            <div className="text-center text-sm text-gray-300 mb-2">BEST SCORE</div>
            <div className="text-center text-xl font-bold text-yellow-400">
              {formatScore(bestScore.score)}
            </div>
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex space-x-4">
          <button
            onClick={() => router.push(`/play/${songId}`)}
            className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-bold"
          >
            RETRY
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-bold"
          >
            SONG SELECT
          </button>
        </div>
      </div>
    </div>
  )
}
