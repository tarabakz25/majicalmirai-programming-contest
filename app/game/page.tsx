import { useState } from "react"
import { SelectSongs } from "@/components/SelectSongs"
import { songList } from "@/data/songs"
import { SongConfig } from "@/types/song"

export default function GamePage() {
  const [selectedSong, setSelectedSong] = useState<SongConfig | null>(null)

  const { playerReady, player } = 
}