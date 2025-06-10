"use client"

import { useState, useEffect } from "react"
import { SongSelector } from "@/components/SongSelector"

// TextAlive JSONデータから楽曲情報を作成
const songs = [
  {
    id: "song1",
    title: "楽曲1",
    artist: "初音ミク",
    url: "https://piapro.jp/t/ULcJ/20250205120202",
    difficulty: { easy: 1, normal: 3, hard: 5 }
  },
  {
    id: "song2",
    title: "楽曲2",
    artist: "初音ミク",
    url: "https://piapro.jp/t/SuQO/20250127235813",
    difficulty: { easy: 2, normal: 4, hard: 6 }
  },
  {
    id: "song3",
    title: "楽曲3",
    artist: "初音ミク",
    url: "https://piapro.jp/t/Ppc9/20241224135843",
    difficulty: { easy: 2, normal: 4, hard: 7 }
  },
  {
    id: "song4",
    title: "楽曲4",
    artist: "初音ミク",
    url: "https://piapro.jp/t/oTaJ/20250204234235",
    difficulty: { easy: 3, normal: 5, hard: 8 }
  },
  {
    id: "song5",
    title: "楽曲5",
    artist: "初音ミク",
    url: "https://piapro.jp/t/XiaI/20240202150903",
    difficulty: { easy: 3, normal: 6, hard: 9 }
  },
  {
    id: "song6",
    title: "楽曲6",
    artist: "初音ミク",
    url: "https://piapro.jp/t/oBSg/20240130010349",
    difficulty: { easy: 4, normal: 7, hard: 10 }
  }
]

export default function HomePage() {
  const [showTitle, setShowTitle] = useState(true)
  const [titleAnimation, setTitleAnimation] = useState(false)

  useEffect(() => {
    // タイトルアニメーション
    const timer = setTimeout(() => {
      setTitleAnimation(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const handleStart = () => {
    setShowTitle(false)
  }

  if (showTitle) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <h1
            className={`text-6xl md:text-8xl font-bold text-white mb-8 transition-all duration-1000 ${
              titleAnimation ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
            }`}
            style={{
              textShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
              background: 'linear-gradient(45deg, #FFD700, #FF69B4, #00BFFF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            LyricRails!
          </h1>

          <p className="text-xl text-gray-300 mb-8 opacity-80">
            歌詞と音楽に合わせてリズムゲーム
          </p>

          <button
            onClick={handleStart}
            className={`
              px-8 py-4 text-xl font-bold text-white rounded-lg
              bg-gradient-to-r from-pink-500 to-purple-600
              hover:from-pink-600 hover:to-purple-700
              transform transition-all duration-300
              hover:scale-105 hover:shadow-lg
              ${titleAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
            `}
            style={{
              boxShadow: '0 4px 20px rgba(255, 105, 180, 0.4)',
            }}
          >
            🎵 Touch to Start 🎵
          </button>
        </div>
      </div>
    )
  }

  return <SongSelector songs={songs} />
}
