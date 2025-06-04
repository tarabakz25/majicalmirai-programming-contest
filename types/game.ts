// ゲームの基本型定義
export interface Note {
  id: string;
  startTime: number; // ミリ秒
  lane: number; // 0-3 (PC) または 0 (モバイル)
  type: 'tap' | 'hold' | 'slide';
  duration?: number; // hold/slideの場合
  word?: string; // 対応する歌詞
  character?: string; // 対応する文字
}

export interface Chart {
  songId: string;
  notes: Note[];
  bpm: number;
  totalDuration: number;
  difficulty: 'easy' | 'normal' | 'hard';
}

export interface JudgmentResult {
  type: 'perfect' | 'great' | 'good' | 'miss';
  timing: number; // ms、負の値は早い、正の値は遅い
  score: number;
  accuracy: number; // 0-1の範囲
}

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  score: number;
  combo: number;
  maxCombo: number;
  accuracy: number;
  judgments: {
    perfect: number;
    great: number;
    good: number;
    miss: number;
  };
}

export interface GameConfig {
  keyBinding: {
    lane0: string;
    lane1: string;
    lane2: string;
    lane3: string;
  };
  volume: number;
  showDebug: boolean;
  judgmentTiming: {
    perfect: number; // ±ms
    great: number;
    good: number;
  };
}

export interface ScoreRecord {
  songId: string;
  score: number;
  accuracy: number;
  maxCombo: number;
  judgments: GameState['judgments'];
  timestamp: number;
  lyricsSync: number; // 歌詞シンク率 0-1
} 