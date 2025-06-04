import { IWord, IChar } from 'textalive-app-api';
import { Note, Chart } from '@/types/game';
import { GAME_CONSTANTS } from './constants';

export interface ChartGeneratorOptions {
  difficulty: 'easy' | 'normal' | 'hard';
  laneCount: number;
  noteSpacing: number; // 最小ノーツ間隔 (ms)
  preferredBPM?: number;
}

export class ChartGenerator {
  private options: ChartGeneratorOptions;

  constructor(options: ChartGeneratorOptions) {
    this.options = options;
  }

  // 歌詞データから譜面を生成
  generateChart(
    songId: string,
    words: IWord[],
    chars: IChar[],
    duration: number
  ): Chart {
    if (!words.length) {
      return this.createEmptyChart(songId, duration);
    }

    // BPM計算
    const bpm = this.calculateBPM(words);
    
    // 難易度設定取得
    const difficultyConfig = GAME_CONSTANTS.DIFFICULTY[this.options.difficulty.toUpperCase() as keyof typeof GAME_CONSTANTS.DIFFICULTY];
    
    // ノーツ生成対象の単語を選択
    const selectedWords = this.selectWordsForNotes(words, difficultyConfig.NOTE_DENSITY);
    
    // レーン分散してノーツを生成
    const notes = this.distributeNotesToLanes(selectedWords, difficultyConfig.LANE_DISTRIBUTION);

    return {
      songId,
      notes,
      bpm,
      totalDuration: duration,
      difficulty: this.options.difficulty,
    };
  }

  // 文字単位での詳細譜面生成
  generateCharacterChart(
    songId: string,
    chars: IChar[],
    duration: number
  ): Chart {
    if (!chars.length) {
      return this.createEmptyChart(songId, duration);
    }

    const bpm = this.calculateCharBPM(chars);
    const difficultyConfig = GAME_CONSTANTS.DIFFICULTY[this.options.difficulty.toUpperCase() as keyof typeof GAME_CONSTANTS.DIFFICULTY];
    
    // 文字選択（密度に基づく）
    const selectedChars = this.selectCharsForNotes(chars, difficultyConfig.NOTE_DENSITY);
    
    // ノーツ変換
    const notes = this.convertCharsToNotes(selectedChars, difficultyConfig.LANE_DISTRIBUTION);

    return {
      songId,
      notes,
      bpm,
      totalDuration: duration,
      difficulty: this.options.difficulty,
    };
  }

  // BPM計算（単語ベース）
  private calculateBPM(words: IWord[]): number {
    if (words.length < 4) return this.options.preferredBPM || 120;

    const startTimes = words.slice(0, 20).map(w => w.startTime);
    const intervals: number[] = [];
    
    for (let i = 1; i < startTimes.length; i++) {
      const interval = startTimes[i] - startTimes[i - 1];
      if (interval > 200 && interval < 2000) { // 有効範囲のインターバルのみ
        intervals.push(interval);
      }
    }

    if (intervals.length === 0) return this.options.preferredBPM || 120;

    // 中央値ベースのBPM計算
    intervals.sort((a, b) => a - b);
    const medianInterval = intervals[Math.floor(intervals.length / 2)];
    const calculatedBPM = Math.round(60000 / medianInterval);
    
    // 妥当なBPM範囲に収める (60-200)
    return Math.max(60, Math.min(200, calculatedBPM));
  }

  // BPM計算（文字ベース）
  private calculateCharBPM(chars: IChar[]): number {
    if (chars.length < 8) return this.options.preferredBPM || 120;

    const avgCharDuration = chars.reduce((sum, char) => 
      sum + (char.endTime - char.startTime), 0) / chars.length;
    
    // 文字継続時間からBPMを推定
    const estimatedBPM = Math.round(60000 / (avgCharDuration * 4));
    return Math.max(60, Math.min(200, estimatedBPM));
  }

  // ノーツ生成用の単語選択
  private selectWordsForNotes(words: IWord[], density: number): IWord[] {
    const totalWords = words.length;
    const targetCount = Math.floor(totalWords * density);
    
    // 重要度スコアリング
    const scoredWords = words.map((word, index) => ({
      word,
      score: this.calculateWordImportance(word, index, words),
    }));

    // スコア順にソートして上位を選択
    scoredWords.sort((a, b) => b.score - a.score);
    
    return scoredWords
      .slice(0, targetCount)
      .map(item => item.word)
      .sort((a, b) => a.startTime - b.startTime); // 時間順に再ソート
  }

  // 単語の重要度計算
  private calculateWordImportance(word: IWord, index: number, words: IWord[]): number {
    let score = 0;

    // 1. 持続時間スコア（長い単語ほど重要）
    const duration = word.endTime - word.startTime;
    score += Math.min(duration / 1000, 3) * 10;

    // 2. ポジションスコア（曲の序盤・終盤は重要）
    const progress = index / words.length;
    if (progress < 0.2 || progress > 0.8) {
      score += 15;
    }

    // 3. 間隔スコア（適度な間隔があると重要）
    if (index > 0) {
      const prevWord = words[index - 1];
      const gap = word.startTime - prevWord.endTime;
      if (gap > 500 && gap < 2000) {
        score += 10;
      }
    }

    // 4. 長さスコア（テキストが長いほど重要）
    if (word.text) {
      score += Math.min(word.text.length, 10);
    }

    return score;
  }

  // 文字選択
  private selectCharsForNotes(chars: IChar[], density: number): IChar[] {
    const targetCount = Math.floor(chars.length * density);
    
    // 等間隔選択を基本とし、重要な文字を優先
    const step = Math.floor(chars.length / targetCount);
    const selected: IChar[] = [];

    for (let i = 0; i < chars.length; i += step) {
      if (selected.length >= targetCount) break;
      selected.push(chars[i]);
    }

    return selected;
  }

  // 単語をレーンに分散してノーツに変換
  private distributeNotesToLanes(words: IWord[], maxLanes: number): Note[] {
    const notes: Note[] = [];
    let currentLane = 0;
    let lastNoteTime = 0;

    for (const word of words) {
      // 最小間隔チェック
      if (word.startTime - lastNoteTime < this.options.noteSpacing) {
        continue;
      }

      // レーン決定
      const lane = this.determineLane(word, currentLane, maxLanes);
      
      // ノーツタイプ決定
      const noteType = this.determineNoteType(word);

      const note: Note = {
        id: `note_${word.startTime}_${lane}`,
        startTime: word.startTime,
        lane,
        type: noteType,
        word: word.text || '',
        duration: noteType === 'hold' ? Math.max(word.endTime - word.startTime, 200) : undefined,
      };

      notes.push(note);
      currentLane = lane;
      lastNoteTime = word.startTime;
    }

    return notes;
  }

  // 文字をノーツに変換
  private convertCharsToNotes(chars: IChar[], maxLanes: number): Note[] {
    const notes: Note[] = [];
    let currentLane = 0;

    for (const char of chars) {
      const lane = currentLane % Math.min(maxLanes, this.options.laneCount);
      
      const note: Note = {
        id: `char_note_${char.startTime}_${lane}`,
        startTime: char.startTime,
        lane,
        type: 'tap',
        character: char.text || '',
        duration: char.endTime - char.startTime,
      };

      notes.push(note);
      currentLane = (currentLane + 1) % maxLanes;
    }

    return notes;
  }

  // レーン決定ロジック
  private determineLane(word: IWord, currentLane: number, maxLanes: number): number {
    const availableLanes = Math.min(maxLanes, this.options.laneCount);
    
    // 基本は循環
    let targetLane = (currentLane + 1) % availableLanes;
    
    // 単語の特性に基づく調整
    if (word.text) {
      // 文字数が多い場合は中央レーン寄り
      if (word.text.length > 3) {
        targetLane = Math.floor(availableLanes / 2);
      }
      
      // 特定文字の場合の特別処理
      if (word.text.includes('！') || word.text.includes('!')) {
        targetLane = availableLanes - 1; // 右端
      }
    }

    return targetLane;
  }

  // ノーツタイプ決定
  private determineNoteType(word: IWord): Note['type'] {
    const duration = word.endTime - word.startTime;
    
    // 長い単語はホールドノーツ
    if (duration > 800) {
      return 'hold';
    }
    
    // 通常はタップノーツ
    return 'tap';
  }

  // 空の譜面作成
  private createEmptyChart(songId: string, duration: number): Chart {
    return {
      songId,
      notes: [],
      bpm: this.options.preferredBPM || 120,
      totalDuration: duration,
      difficulty: this.options.difficulty,
    };
  }
}

// 便利な譜面生成関数
export const createChart = (
  songId: string,
  words: IWord[],
  chars: IChar[],
  duration: number,
  options: Partial<ChartGeneratorOptions> = {}
): Chart => {
  const generator = new ChartGenerator({
    difficulty: 'normal',
    laneCount: 4,
    noteSpacing: 300,
    ...options,
  });

  // 文字データがある場合は文字ベース、そうでなければ単語ベース
  if (chars.length > words.length * 2) {
    return generator.generateCharacterChart(songId, chars, duration);
  } else {
    return generator.generateChart(songId, words, chars, duration);
  }
}; 