export interface SongVideoConfig {
  // 音楽地図訂正履歴
  beatId: number;
  chordId: number;
  repetitiveSegmentId: number;
  // 歌詞URL と 歌詞タイミング訂正履歴
  lyricId: number;
  lyricDiffId: number;
}

export interface SongConfig {
  songUrl: string;            // piapro の曲ページ URL
  video: SongVideoConfig;
}
