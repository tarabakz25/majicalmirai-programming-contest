"use client"
import { useState } from "react"
import { SelectSongs } from "@/components/SelectSongs"
import { LyricsDisplay } from "@/components/LyricsDisplay"
import { songList } from "@/data/songs"
import { SongConfig } from "@/types/song"
import { MusicProvider } from "@/components/MusicProvider"

export default function GamePage() {
  return <MusicProvider />;
}