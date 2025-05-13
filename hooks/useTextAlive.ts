'use client'
import { useEffect, useRef, useState } from 'react'
import type { Player } from 'textalive-app-api'
import { initTextAlive, createTextAliveListener } from '@/lib/textAlive'
import { SongConfig } from '@/types/song'

export const useTextAlive = (songConfig: SongConfig | null) => {
  const [player, setPlayer] = useState<Player | null>(null)
  const [playerReady, setPlayerReady] = useState(false)
  const containerRef = useRef<HTMLElement | null>(null)

  // 隠し video 要素を一度だけ生成
  useEffect(() => {
    // テキストアライブが内部で埋め込むメディア要素のコンテナ
    const container = document.createElement('div')
    container.style.display = 'none'
    document.body.appendChild(container)
    containerRef.current = container

    return () => {
      if (containerRef.current) {
        document.body.removeChild(containerRef.current)
        containerRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!songConfig || !containerRef.current) return

    setPlayerReady(false)

    const playerInstance = initTextAlive(containerRef.current)
    setPlayer(playerInstance)
    const listener = createTextAliveListener(
      () => {}, // フレーズ更新不要
      (_p: Player) => {
        setPlayerReady(true)
      },
      () => {}, // ビート更新は不要
      0 // ディレイなし
    )
    playerInstance.addListener(listener)

    playerInstance
      .createFromSongUrl(songConfig.songUrl, {
        video: songConfig.video,
      })
      .catch(console.error)

    return () => {
      playerInstance.removeListener(listener)
      playerInstance.dispose()
      setPlayer(null)
      setPlayerReady(false)
    }
  }, [songConfig])

  return { playerReady, player }
}