import { useState } from "react"
import { SongConfig } from "../types/song"

interface SelectSongsProps {
  songs: SongConfig[]
  onSelect: (song: SongConfig) => void
}

export const SelectSongs: React.FC<SelectSongsProps> = ({ songs, onSelect }) => {
  const [selectedSong, setSelectedSong] = useState<SongConfig | null>(null)

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-bold">楽曲を選択してください</h1>
      <select 
        className="p-2 border rounded-md w-64"
        onChange={(e) => {
          console.log("選択された曲URL:", e.target.value);
          const song = songs.find(s => s.songUrl === e.target.value);
          console.log("見つかった曲:", song);
          if (song) setSelectedSong(song);
        }}
      >
        <option value="">-- 楽曲を選択 --</option>
        {songs.map((song) => (
          <option key={song.songUrl} value={song.songUrl}>
            {song.songUrl.split('/').pop()?.split('?')[0] || song.songUrl}
          </option>
        ))}
      </select>
      <button 
        className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300"
        disabled={!selectedSong}
        onClick={() => {
          if (selectedSong) {
            console.log("選択された曲を送信:", selectedSong);
            onSelect(selectedSong);
          }
        }}
      >
        選択
      </button>
    </div>
  )
}