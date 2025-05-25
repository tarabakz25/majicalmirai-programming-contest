"use client"
import { useEffect } from "react"
import { useState } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import Gsap from 'gsap'
import { MusicProvider } from "@/components/MusicProvider"
import { SelectSongs } from "@/components/SelectSongs"
import { LyricsDisplay } from "@/components/LyricsDisplay"
import { songList } from "@/data/songs"
import { SongConfig } from "@/types/song"

const titleText = "LirycRails!"

export default function HomePage() {
  const [isMusicSelected, setIsMusicSelected] = useState(false);


  useEffect(() => {
    Gsap.set(".title-char", { opacity: 0, x: 0 })
    Gsap.set(".start-btn", { opacity: 0, x: 0 })
    Gsap.to(".title-char", {
      opacity: 1,
      ease: "power2.inOut",
      delay: 0.5
    })
    Gsap.to(".start-btn", {
      opacity: 1,
      ease: "power2.inOut",
      delay: 2
    })
  }, [])

  if (!isMusicSelected) {
    return <MusicProvider />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white text-black">
      <h1 className="text-4xl font-bold">
        {titleText.split("").map((char, i) => (
          <span key={i} className="title-char inline-block">{char}</span>
        ))}
      </h1>
      <button className="start-btn mt-4 px-4 py-2  text-white rounded-md" onClick={() => redirect("/game")}>Touch to Start</button>
    </div>
  )

  return <MusicProvider />;
}
