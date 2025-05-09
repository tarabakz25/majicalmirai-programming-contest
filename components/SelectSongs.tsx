import { useState } from "react"
import { SongConfig } from "../types/song"

interface SelectSongsProps {
  songs: SongConfig[]
  onSelect: (song: SongConfig) => void
}

export const SelectSongs: React.FC<SelectSongsProps> = ({ songs, onSelect }) => {
  const [selectedSong, setSelectedSong] = useState<SongConfig | null>(null)

  return (
    <div>
      <h1>Select a song</h1>
      <select name="" id="">
        {songs.map((song) => (
          <option key={song.songUrl} value={song.songUrl}>
            {song.songUrl}
          </option>
        ))}
      </select>
      <button onClick={() => onSelect(selectedSong!)}>Select</button>
    </div>
  )
}