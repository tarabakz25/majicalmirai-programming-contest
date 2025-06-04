"use client"
import { useEffect } from "react"
import { useState } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import Gsap, { set } from 'gsap'
import { MusicProvider } from "@/components/MusicProvider"
import { SelectSongs } from "@/components/SelectSongs"
import { LyricsDisplay } from "@/components/LyricsDisplay"
import { songList } from "@/data/songs"
import { SongConfig } from "@/types/song"

const titleText = "LirycRails!"

export default function HomePage() {
  const [isClickedStart, setIsClickedStart] = useState(false);
  const [isMusicSelected, setIsMusicSelected] = useState(false);

  function handleClickStart(e: any) {
    e.preventDefault();
    setIsClickedStart(true);
  }

  function handleClickMusic(e: any) {
    e.preventDefault();
    setIsMusicSelected(true);
  }

  if (!isClickedStart) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-4xl font-bold">LirycRails!</h1>
        <button className="start-btn mt-4 px-4 py-2  text-white rounded-md" onClick={handleClickStart}>Touch to Start</button>
      </div>
    )
  }

  if (!isMusicSelected) {
    return <MusicProvider />;
  }
}
