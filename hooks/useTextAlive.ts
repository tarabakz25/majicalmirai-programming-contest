'use client'
import { useEffect, useRef, useState } from 'react'
import type { Player } from 'textalive-app-api'
import { initTextAlive, createTextAliveListener } from '@/lib/textAlive'
import { SongConfig } from '@/types/song'

export const useTextAlive = (songConfig: SongConfig | null) => {
  const [player, setPlayer] = useState<Player | null>(null)
  const [playerReady, setPlayerReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  // 隠し video 要素を一度だけ生成
  useEffect(() => {
    const video = document.createElement('video')
    video.style.display = 'none'
    // play の promise rejection をキャッチして AbortError を無視
    const origPlay = video.play.bind(video)
    video.play = () => {
      const playPromise = origPlay()
      playPromise.catch(error => {
        if (error.name !== 'AbortError') {
          console.error(error)
        }
      })
      return playPromise
    }
    document.body.appendChild(video)
    videoRef.current = video

    return () => {
      if (videoRef.current) {
        document.body.removeChild(videoRef.current)
        videoRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!songConfig || !videoRef.current) return

    setPlayerReady(false)

    const playerInstance = initTextAlive(videoRef.current)
    setPlayer(playerInstance)
    const listener = createTextAliveListener(
      () => {}, // フレーズ更新は不要
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