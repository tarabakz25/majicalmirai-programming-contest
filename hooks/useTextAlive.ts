import { useEffect, useState } from "react"
import { initTextAlive, loadSong } from "@/lib/textAlive"
import { SongConfig } from "@/types/song"

export function useTextAlive(songConfig: SongConfig) {
  const [playerReady, setPlayerReady] = useState(false)
  const [player, setPlayer] = useState<any>(null)
  
  useEffect(() => {
    initTextAlive((playerInstance) => {
      setPlayer(playerInstance)
      
      const loadSongAsync = async () => {
        try {
          await loadSong(songConfig)
          setPlayerReady(true)
        } catch (error) {
          console.error("Failed to load song", error)
        }
      }
      
      loadSongAsync()
    })
  }, [songConfig.songUrl, JSON.stringify(songConfig.video)])

  return { playerReady, player }
}