import React, { useRef, useEffect, useState } from 'react'
import { GameCore } from '@/lib/gameCore'
import { GameState, Note } from '@/types/game'
import { GAME_CONSTANTS } from '@/lib/constants'
import { JudgmentEffect } from './JudgmentEffect'

interface GameCanvasProps {
  gameCore: GameCore
  gameState: GameState
  onNoteHit: (lane: number) => void
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameCore,
  gameState,
  onNoteHit,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [visibleNotes, setVisibleNotes] = useState<Note[]>([])
  const [judgmentEffects, setJudgmentEffects] = useState<Array<{
    id: string
    type: string
    lane: number
    timestamp: number
  }>>([])

  // キャンバスサイズ
  const CANVAS_WIDTH = 800
  const CANVAS_HEIGHT = 600
  const LANE_WIDTH = CANVAS_WIDTH / 4
  const JUDGMENT_LINE_Y = CANVAS_HEIGHT - 100

  // 可視ノーツの更新
  useEffect(() => {
    const notes = gameCore.getVisibleNotes(gameState.currentTime)
    setVisibleNotes(notes)
  }, [gameCore, gameState.currentTime])

  // キャンバス描画
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // キャンバスクリア
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // 背景グラデーション
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
    gradient.addColorStop(0, 'rgba(139, 69, 19, 0.3)')
    gradient.addColorStop(1, 'rgba(25, 25, 112, 0.3)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // レーン境界線
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 2
    for (let i = 1; i < 4; i++) {
      ctx.beginPath()
      ctx.moveTo(i * LANE_WIDTH, 0)
      ctx.lineTo(i * LANE_WIDTH, CANVAS_HEIGHT)
      ctx.stroke()
    }

    // 判定ライン
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(0, JUDGMENT_LINE_Y)
    ctx.lineTo(CANVAS_WIDTH, JUDGMENT_LINE_Y)
    ctx.stroke()

    // ノーツ描画
    visibleNotes.forEach(note => {
      drawNote(ctx, note)
    })

  }, [visibleNotes])

  // ノーツ描画関数
  const drawNote = (ctx: CanvasRenderingContext2D, note: Note) => {
    const approachTime = GAME_CONSTANTS.NOTES.APPROACH_TIME
    const timeToNote = note.startTime - gameState.currentTime
    const progress = 1 - (timeToNote / approachTime)

    const x = note.lane * LANE_WIDTH + LANE_WIDTH / 2
    const y = JUDGMENT_LINE_Y - (progress * (JUDGMENT_LINE_Y - 50))

    // ノーツの色
    let color = '#4A90E2'
    if (note.type === 'hold') color = '#F5A623'
    if (note.type === 'slide') color = '#7ED321'

    // ノーツ描画
    ctx.fillStyle = color
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 2

    if (note.type === 'tap') {
      // タップノーツ（円）
      ctx.beginPath()
      ctx.arc(x, y, 20, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    } else if (note.type === 'hold') {
      // ホールドノーツ（長方形）
      const holdHeight = (note.duration || 200) / approachTime * (JUDGMENT_LINE_Y - 50)
      ctx.fillRect(x - 25, y, 50, holdHeight)
      ctx.strokeRect(x - 25, y, 50, holdHeight)
    }

    // 歌詞表示
    if (note.word) {
      ctx.fillStyle = '#FFFFFF'
      ctx.font = '14px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(note.word, x, y - 30)
    }
  }

  // タッチ/クリック処理
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const lane = Math.floor(x / LANE_WIDTH)

    if (lane >= 0 && lane < 4) {
      onNoteHit(lane)

      // エフェクト追加
      setJudgmentEffects(prev => [...prev, {
        id: `effect_${Date.now()}_${lane}`,
        type: 'hit',
        lane,
        timestamp: Date.now(),
      }])
    }
  }

  // エフェクトクリーンアップ
  useEffect(() => {
    const interval = setInterval(() => {
      setJudgmentEffects(prev =>
        prev.filter(effect => Date.now() - effect.timestamp < 1000)
      )
    }, 100)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onClick={handleCanvasClick}
        className="border border-gray-600 rounded-lg cursor-pointer"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      />

      {/* 判定エフェクト */}
      {judgmentEffects.map(effect => (
        <JudgmentEffect
          key={effect.id}
          type={effect.type}
          lane={effect.lane}
          onComplete={() => {
            setJudgmentEffects(prev => prev.filter(e => e.id !== effect.id))
          }}
        />
      ))}

      {/* レーンタッチエリア（モバイル用） */}
      <div className="absolute bottom-0 left-0 right-0 h-20 flex md:hidden">
        {[0, 1, 2, 3].map(lane => (
          <button
            key={lane}
            className="flex-1 bg-white bg-opacity-10 border border-white border-opacity-30 text-white font-bold text-lg"
            onTouchStart={() => onNoteHit(lane)}
            onClick={() => onNoteHit(lane)}
          >
            {lane + 1}
          </button>
        ))}
      </div>
    </div>
  )
}