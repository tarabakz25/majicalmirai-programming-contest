"use client"

import { useState } from "react"
import { SelectSongs } from "@/components/SelectSongs"
import { songList } from "@/data/songs"
import { SongConfig } from "@/types/song"
import Link from "next/link"

export default function HomePage() {
  const [songConfig, setSongConfig] = useState<SongConfig | null>(null)

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6">
      <h1 className="text-4xl font-bold">Lyrics Game</h1>
      
      <div className="flex gap-4 mt-4">
        <Link href="/game" className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
          ゲームを始める
        </Link>
      </div>
    </div>
  )
}
