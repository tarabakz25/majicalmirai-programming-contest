"use client"

import React, { useState, useEffect } from "react";
import { Player } from "textalive-app-api";
import { SongConfig } from "@/types/song";
import { songList } from "@/data/songs";
import { SelectSongs } from "@/components/SelectSongs";
import { LyricsDisplay } from "@/components/LyricsDisplay";

export const MusicProvider: React.FC = () => {
  const [songConfig, setSongConfig] = useState<SongConfig | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [playerReady, setPlayerReady] = useState(false);

  // Player の初期化
  useEffect(() => {
    const p = new Player({
      app: { token: process.env.NEXT_PUBLIC_TEXTALIVE_API_KEY || "" },
    });
    setPlayer(p);
    return () => {
      // 特にクリーンアップ不要
    };
  }, []);

  // 選択曲のロード
  useEffect(() => {
    if (player && songConfig) {
      setPlayerReady(false);
      player
        .createFromSongUrl(songConfig.songUrl, {
          video: songConfig.video,
        })
        .then(() => {
          setPlayerReady(true);
        })
        .catch((err) => {
          console.error("曲のロードに失敗しました", err);
        });
    }
  }, [player, songConfig]);

  // 楽曲未選択時に選択画面を表示
  if (!songConfig) {
    return <SelectSongs songs={songList} onSelect={setSongConfig} />;
  }

  // ロード中表示
  if (!playerReady) {
    return (
      <div className="flex items-center justify-center h-screen">
        楽曲をロード中...
      </div>
    );
  }

  // 歌詞表示コンポーネントにプレーヤー渡し
  return <LyricsDisplay player={player!} autoplay />;
};
