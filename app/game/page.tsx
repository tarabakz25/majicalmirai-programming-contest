"use client"
import { useState } from "react"
import { SelectSongs } from "@/components/SelectSongs"
import { LyricsDisplay } from "@/components/LyricsDisplay"
import { songList } from "@/data/songs"
import { SongConfig } from "@/types/song"
import { useTextAlive } from "@/hooks/useTextAlive"

export default function GamePage() {
  const [songConfig, setSongConfig] = useState<SongConfig | null>(null)
  const { playerReady, player } = useTextAlive(songConfig)

  if(!songConfig) {
    return <SelectSongs songs={songList} onSelect={setSongConfig} />
  }

  if(!playerReady) {
    return <div className="flex items-center justify-center h-screen">楽曲をロード中...</div>
  }

  return (
    <div className="w-full h-full">
      <LyricsDisplay player={player} />
    </div>
  )
}