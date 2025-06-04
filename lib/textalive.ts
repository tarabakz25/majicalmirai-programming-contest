import { Player, IWord, IChar, IPhrase, IVideo } from 'textalive-app-api'
import { useEffect, useState, useCallback, useRef } from 'react'
import { TEXTALIVE_CONFIG } from './constants'

export interface TextAliveState {
  player: Player | null;
  isReady: boolean;
  isPlaying: boolean;
  position: number;
  duration: number;
  words: IWord[];
  chars: IChar[];
  phrases: IPhrase[];
}

export const useTextAlive = () => {
  const [state, setState] = useState<TextAliveState>({
    player: null,
    isReady: false,
    isPlaying: false,
    position: 0,
    duration: 0,
    words: [],
    chars: [],
    phrases: [],
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // プレーヤー初期化
  useEffect(() => {
    const player = new Player(TEXTALIVE_CONFIG.APP_OPTIONS);
    
    // プレーヤーイベントリスナー設定
    player.addListener({
      onAppReady: (app: any) => {
        console.log('TextAlive App Ready:', app);
      },
      
      onVideoReady: (video: IVideo) => {
        console.log('Video Ready:', video);
        setState(prev => ({
          ...prev,
          isReady: true,
          duration: video.duration,
          words: video.words || [],
          chars: video.chars || [],
          phrases: video.phrases || [],
        }));
      },
      
      onPlay: () => {
        setState(prev => ({ ...prev, isPlaying: true }));
        // 位置更新タイマー開始
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
          setState(prev => ({
            ...prev,
            position: player.timer.position,
          }));
        }, 16); // 60fps
      },
      
      onPause: () => {
        setState(prev => ({ ...prev, isPlaying: false }));
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      },
      
      onStop: () => {
        setState(prev => ({ ...prev, isPlaying: false, position: 0 }));
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      },
      
      onSeek: (position: number) => {
        setState(prev => ({ ...prev, position }));
      },
    });

    setState(prev => ({ ...prev, player }));

    // クリーンアップ
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      player.dispose();
    };
  }, []);

  // 楽曲ロード
  const loadSong = useCallback(async (songUrl: string, videoOptions?: any) => {
    if (!state.player) return false;
    
    try {
      setState(prev => ({ ...prev, isReady: false }));
      await state.player.createFromSongUrl(songUrl, { video: videoOptions });
      return true;
    } catch (error) {
      console.error('楽曲ロードエラー:', error);
      return false;
    }
  }, [state.player]);

  // 再生制御
  const play = useCallback(() => {
    if (state.player && state.isReady) {
      state.player.requestPlay();
    }
  }, [state.player, state.isReady]);

  const pause = useCallback(() => {
    if (state.player) {
      state.player.requestPause();
    }
  }, [state.player]);

  const stop = useCallback(() => {
    if (state.player) {
      state.player.requestStop();
    }
  }, [state.player]);

  const seek = useCallback((position: number) => {
    if (state.player) {
      // TextAlive APIのシークメソッドを直接呼び出し
      (state.player as any).seekTo(position);
    }
  }, [state.player]);

  // 現在の歌詞取得
  const getCurrentWord = useCallback((): IWord | null => {
    const currentTime = state.position;
    return state.words.find(word => 
      word.startTime <= currentTime && currentTime < word.endTime
    ) || null;
  }, [state.words, state.position]);

  // 現在の文字取得
  const getCurrentChar = useCallback((): IChar | null => {
    const currentTime = state.position;
    return state.chars.find(char => 
      char.startTime <= currentTime && currentTime < char.endTime
    ) || null;
  }, [state.chars, state.position]);

  // 指定時間範囲の歌詞取得
  const getWordsInRange = useCallback((startTime: number, endTime: number): IWord[] => {
    return state.words.filter(word => 
      word.startTime >= startTime && word.endTime <= endTime
    );
  }, [state.words]);

  // 指定時間範囲の文字取得
  const getCharsInRange = useCallback((startTime: number, endTime: number): IChar[] => {
    return state.chars.filter(char => 
      char.startTime >= startTime && char.endTime <= endTime
    );
  }, [state.chars]);

  return {
    ...state,
    loadSong,
    play,
    pause,
    stop,
    seek,
    getCurrentWord,
    getCurrentChar,
    getWordsInRange,
    getCharsInRange,
  };
};

// TextAliveプレーヤーのユーティリティ関数
export const TextAliveUtils = {
  // 歌詞データからビート情報を抽出
  extractBeats: (words: IWord[]): number[] => {
    const beats: number[] = [];
    words.forEach(word => {
      if (word.startTime && !beats.includes(word.startTime)) {
        beats.push(word.startTime);
      }
    });
    return beats.sort((a, b) => a - b);
  },

  // BPM計算
  calculateBPM: (words: IWord[]): number => {
    const beats = TextAliveUtils.extractBeats(words);
    if (beats.length < 2) return 120; // デフォルトBPM

    const intervals = [];
    for (let i = 1; i < Math.min(beats.length, 20); i++) {
      intervals.push(beats[i] - beats[i - 1]);
    }

    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    return Math.round(60000 / avgInterval); // BPM計算
  },

  // 歌詞の文字数統計
  getLyricsStats: (words: IWord[]) => {
    const totalChars = words.reduce((sum, word) => sum + (word.text?.length || 0), 0);
    const totalWords = words.length;
    const duration = words.length > 0 ? 
      (words[words.length - 1].endTime - words[0].startTime) / 1000 : 0;

    return {
      totalChars,
      totalWords,
      duration,
      avgCharsPerSecond: duration > 0 ? totalChars / duration : 0,
      avgWordsPerSecond: duration > 0 ? totalWords / duration : 0,
    };
  },
};