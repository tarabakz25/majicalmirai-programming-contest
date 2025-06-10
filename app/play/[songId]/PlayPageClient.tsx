"use client"

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Player } from 'textalive-app-api'
import { GameCore } from '@/lib/gameCore'
import { ChartGenerator } from '@/lib/chartGenerator'
import { StorageManager } from '@/lib/storage'
import { GameCanvas } from '@/components/GameCanvas'
import { GameHUD } from '@/components/GameHUD'
import { useGameState } from '@/hooks/useGameState'
import { useKeyInput } from '@/hooks/useKeyInput'
import { GameConfig } from '@/types/game'
import { songList } from '@/data/songs'

export default function PlayPageClient() {
  const params = useParams()
  const router = useRouter()
  const songId = params.songId as string
  
  const [player, setPlayer] = useState<Player | null>(null)
  const [gameCore, setGameCore] = useState<GameCore | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [gameConfig, setGameConfig] = useState<GameConfig>(StorageManager.getDefaultConfig())
  
  const { gameState, updateGameState } = useGameState()
  
  // 楽曲データの取得
  const songConfig = songList.find(song => 
    song.songUrl.includes(songId) || song.songUrl.split('/').pop()?.includes(songId)
  )

  // TextAlive Player の初期化
  useEffect(() => {
    if (!songConfig) {
      setError('楽曲が見つかりません')
      return
    }

    const initPlayer = async () => {
      try {
        const p = new Player({
          app: { token: process.env.NEXT_PUBLIC_TEXTALIVE_API_KEY || "" },
        })

        await p.createFromSongUrl(songConfig.songUrl, {
          video: songConfig.video,
        })

        setPlayer(p)
      } catch (err) {
        console.error('Player initialization failed:', err)
        setError('楽曲の読み込みに失敗しました')
      }
    }

    initPlayer()
  }, [songConfig])

  // 譜面生成とゲームコア初期化
  useEffect(() => {
    if (!player || !player.video) return

    const initGame = async () => {
      try {
        // 歌詞データの取得
        const words = player.video.words || []
        const chars = player.video.chars || []
        const duration = player.video.duration || 0

        // 譜面生成
        const generator = new ChartGenerator({
          difficulty: 'normal',
          laneCount: 4,
          noteSpacing: 300,
        })

        const generatedChart = generator.generateChart(songId, words, chars, duration)

        // ゲームコア初期化
        const config = StorageManager.loadConfig()
        setGameConfig(config)
        
        const core = new GameCore(generatedChart, config)
        setGameCore(core)
        
        setIsLoading(false)
      } catch (err) {
        console.error('Game initialization failed:', err)
        setError('ゲームの初期化に失敗しました')
      }
    }

    initGame()
  }, [player, songId])

  // ゲームループ
  useEffect(() => {
    if (!gameCore || !player) return

    let animationFrame: number

    const gameLoop = () => {
      const currentTime = player.timer?.position || 0
      gameCore.updateGame(currentTime)
      updateGameState(gameCore.getGameState())
      
      animationFrame = requestAnimationFrame(gameLoop)
    }

    if (gameState.isPlaying) {
      gameLoop()
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [gameCore, player, gameState.isPlaying, updateGameState])

  // キー入力処理
  const handleKeyPress = useCallback((lane: number) => {
    if (!gameCore) return
    
    const result = gameCore.onKeyPress(lane)
    if (result) {
      // 判定結果の処理（エフェクト表示など）
      console.log('Judgment:', result)
    }
  }, [gameCore])

  useKeyInput(gameConfig.keyBinding, handleKeyPress)

  // ゲーム開始
  const startGame = useCallback(() => {
    if (!gameCore || !player) return
    
    gameCore.startGame()
    player.requestPlay()
    updateGameState(gameCore.getGameState())
  }, [gameCore, player, updateGameState])

  // ゲーム終了処理
  useEffect(() => {
    if (!gameCore || !player) return

    const handleSongEnd = () => {
      gameCore.stopGame()
      
      // スコア保存
      const finalState = gameCore.getGameState()
      const scoreRecord = {
        songId,
        score: finalState.score,
        accuracy: finalState.accuracy,
        maxCombo: finalState.maxCombo,
        judgments: finalState.judgments,
        timestamp: Date.now(),
        lyricsSync: gameCore.getLyricsSync(),
      }
      
      StorageManager.saveScore(scoreRecord)
      
      // リザルト画面へ遷移
      router.push(`/result/${songId}`)
    }

    player.addListener({
      onStop: handleSongEnd,
      onVideoReady: () => {
        console.log('Video ready')
      }
    })

    return () => {
      player.removeListener({
        onStop: handleSongEnd,
      })
    }
  }, [gameCore, player, router, songId])

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">エラー</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-lg">楽曲を読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-purple-900 to-blue-900">
      {/* ゲームHUD */}
      <GameHUD 
        gameState={gameState}
        onPause={() => gameCore?.pauseGame()}
        onResume={() => gameCore?.resumeGame()}
        progress={gameCore?.getProgress() || 0}
      />
      
      {/* ゲームキャンバス */}
      <div className="flex-1 relative">
        {gameCore && (
          <GameCanvas
            gameCore={gameCore}
            gameState={gameState}
            onNoteHit={handleKeyPress}
          />
        )}
      </div>
      
      {/* 開始ボタン（ゲーム開始前のみ表示） */}
      {!gameState.isPlaying && !gameState.isPaused && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <button
            onClick={startGame}
            className="px-8 py-4 bg-green-500 text-white text-xl font-bold rounded-lg hover:bg-green-600 transition-colors"
          >
            ゲーム開始
          </button>
        </div>
      )}
    </div>
  )
}
