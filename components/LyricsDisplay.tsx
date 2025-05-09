import { useEffect, useState } from "react"
import { Player, IWord } from "textalive-app-api"

interface LyricsDisplayProps {
  player: Player
}

export const LyricsDisplay: React.FC<LyricsDisplayProps> = ({ player }) => {
  const [currentWords, setCurrentWords] = useState<IWord[]>([])
  const [position, setPosition] = useState(0)

  useEffect(() => {
    if (!player) return
    
    // プレイヤーのイベントリスナー設定
    const onTimeUpdate = (position: number) => {
      setPosition(position)
    }
    
    const onPlay = () => {
      console.log("Player started")
    }
    
    const onPause = () => {
      console.log("Player paused")
    }
    
    player.addListener({
      onTimeUpdate,
      onPlay,
      onPause
    })
    
    // 楽曲の再生開始
    player.requestPlay()
    
    return () => {
      player.removeListener({
        onTimeUpdate,
        onPlay,
        onPause
      })
      player.requestPause()
    }
  }, [player])
  
  useEffect(() => {
    if (!player || !player.video) return
    
    // 現在の再生位置の歌詞を取得
    const words = player.video.findWord(position) || []
    setCurrentWords(Array.isArray(words) ? words : [words])
  }, [player, position])

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="relative w-full h-32 bg-gray-100 flex items-center justify-center overflow-hidden">
        <div className="text-4xl font-bold">
          {currentWords.length > 0 
            ? currentWords.map(word => word.text).join(" ") 
            : "歌詞を待っています..."}
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