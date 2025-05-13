import { useEffect, useState } from "react"
import { Player, IWord } from "textalive-app-api"

interface LyricsDisplayProps {
  player: Player
  autoplay?: boolean
}

export const LyricsDisplay: React.FC<LyricsDisplayProps> = ({ player, autoplay = false }) => {
  const [currentWords, setCurrentWords] = useState<IWord[]>([])
  const [position, setPosition] = useState(0)

  useEffect(() => {
    if (!player) return
    const onTimeUpdate = (pos: number) => {
      console.log("🕒 onTimeUpdate, position:", pos)
      setPosition(pos)
    }
    const onPlay = () => console.log("Player started")
    const onPause = () => console.log("Player paused")

    player.addListener({ onTimeUpdate, onPlay, onPause })
    if (autoplay) {
      player.requestPlay()
    }

    return () => {
      player.removeListener({ onTimeUpdate, onPlay, onPause })
      player.requestPause()
    }
  }, [player, autoplay])

  useEffect(() => {
    console.log("🔍 findWord 位置:", position)
    if (!player || !player.video) {
      console.log("❌ player or video not ready yet")
      return
    }
    const words = player.video.findWord(position) || []
    console.log("✅ findWord 結果:", words)
    setCurrentWords(Array.isArray(words) ? words : [words])
  }, [player, position])

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="relative w-full h-32 bg-gray-100 flex items-center justify-center overflow-hidden">
        <div className="text-4xl font-bold text-black">
          {currentWords.length > 0
            ? currentWords.map(word => word.text).join(" ")
            : ""}
        </div>
      </div>
      <div className="mt-8 flex gap-4">
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
          onClick={() => player.requestPlay()}
        >
          再生
        </button>
        <button 
          className="px-4 py-2 bg-red-500 text-white rounded-md"
          onClick={() => player.requestPause()}
        >
          一時停止
        </button>
      </div>
    </div>
  )
}