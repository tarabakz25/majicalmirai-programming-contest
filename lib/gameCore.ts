import { Note, Chart, JudgmentResult, GameState, GameConfig } from '@/types/game';
import { GAME_CONSTANTS } from './constants';

export class GameCore {
  private gameState: GameState;
  private config: GameConfig;
  private chart: Chart;
  private activeNotes: Map<string, Note>;
  private processedNotes: Set<string>;
  private inputCallbacks: Map<number, () => void>;

  constructor(chart: Chart, config: GameConfig) {
    this.chart = chart;
    this.config = config;
    this.activeNotes = new Map();
    this.processedNotes = new Set();
    this.inputCallbacks = new Map();

    // 初期ゲーム状態
    this.gameState = {
      isPlaying: false,
      isPaused: false,
      currentTime: 0,
      score: 0,
      combo: 0,
      maxCombo: 0,
      accuracy: 0,
      judgments: {
        perfect: 0,
        great: 0,
        good: 0,
        miss: 0,
      },
    };
  }

  // ゲーム状態の更新
  updateGame(currentTime: number): void {
    this.gameState.currentTime = currentTime;
    
    // アクティブノーツの更新
    this.updateActiveNotes(currentTime);
    
    // ミス判定チェック
    this.checkMissedNotes(currentTime);
    
    // 統計の更新
    this.updateStatistics();
  }

  // キー入力処理
  onKeyPress(lane: number): JudgmentResult | null {
    const activeNote = this.findNoteForJudgment(lane, this.gameState.currentTime);
    
    if (!activeNote) {
      // 空振り - ペナルティなし
      return null;
    }

    // 判定実行
    const result = this.judgeNote(activeNote, this.gameState.currentTime);
    
    // ノーツを処理済みにマーク
    this.processedNotes.add(activeNote.id);
    this.activeNotes.delete(activeNote.id);
    
    // ゲーム状態更新
    this.applyJudgmentResult(result);
    
    return result;
  }

  // キー離し処理（ホールドノーツ用）
  onKeyRelease(lane: number): JudgmentResult | null {
    // ホールドノーツの終了判定
    const holdNote = this.findActiveHoldNote(lane);
    
    if (!holdNote || !holdNote.duration) {
      return null;
    }

    const expectedEndTime = holdNote.startTime + holdNote.duration;
    const timing = this.gameState.currentTime - expectedEndTime;
    
    // ホールドノーツの終了判定
    const result = this.judgeHoldEnd(holdNote, timing);
    
    // 処理済みにマーク
    this.processedNotes.add(holdNote.id);
    this.activeNotes.delete(holdNote.id);
    
    this.applyJudgmentResult(result);
    
    return result;
  }

  // アクティブノーツの更新
  private updateActiveNotes(currentTime: number): void {
    const approachTime = GAME_CONSTANTS.NOTES.APPROACH_TIME;
    
    // アプローチ範囲内のノーツを検索
    for (const note of this.chart.notes) {
      if (this.processedNotes.has(note.id)) continue;
      if (this.activeNotes.has(note.id)) continue;
      
      // アプローチ範囲内に入った
      if (note.startTime - currentTime <= approachTime && 
          note.startTime - currentTime >= -GAME_CONSTANTS.JUDGMENT_TIMING.GOOD) {
        this.activeNotes.set(note.id, note);
      }
    }
  }

  // ミス判定チェック
  private checkMissedNotes(currentTime: number): void {
    const missWindow = GAME_CONSTANTS.JUDGMENT_TIMING.GOOD;
    
    for (const [noteId, note] of this.activeNotes) {
      // 判定窓を過ぎた
      if (currentTime - note.startTime > missWindow) {
        const missResult: JudgmentResult = {
          type: 'miss',
          timing: currentTime - note.startTime,
          score: GAME_CONSTANTS.SCORE.MISS,
          accuracy: 0,
        };
        
        this.applyJudgmentResult(missResult);
        this.processedNotes.add(noteId);
        this.activeNotes.delete(noteId);
      }
    }
  }

  // 判定対象ノーツ検索
  private findNoteForJudgment(lane: number, currentTime: number): Note | null {
    let bestNote: Note | null = null;
    let bestTiming = Infinity;
    
    for (const note of this.activeNotes.values()) {
      if (note.lane !== lane) continue;
      
      const timing = Math.abs(currentTime - note.startTime);
      const maxTiming = GAME_CONSTANTS.JUDGMENT_TIMING.GOOD;
      
      if (timing <= maxTiming && timing < bestTiming) {
        bestNote = note;
        bestTiming = timing;
      }
    }
    
    return bestNote;
  }

  // アクティブなホールドノーツ検索
  private findActiveHoldNote(lane: number): Note | null {
    for (const note of this.activeNotes.values()) {
      if (note.lane === lane && note.type === 'hold') {
        return note;
      }
    }
    return null;
  }

  // ノーツ判定
  private judgeNote(note: Note, currentTime: number): JudgmentResult {
    const timing = currentTime - note.startTime;
    const absTiming = Math.abs(timing);
    
    let judgmentType: JudgmentResult['type'];
    let baseScore: number;
    let accuracy: number;
    
    if (absTiming <= GAME_CONSTANTS.JUDGMENT_TIMING.PERFECT) {
      judgmentType = 'perfect';
      baseScore = GAME_CONSTANTS.SCORE.PERFECT;
      accuracy = 1.0;
    } else if (absTiming <= GAME_CONSTANTS.JUDGMENT_TIMING.GREAT) {
      judgmentType = 'great';
      baseScore = GAME_CONSTANTS.SCORE.GREAT;
      accuracy = 0.8;
    } else if (absTiming <= GAME_CONSTANTS.JUDGMENT_TIMING.GOOD) {
      judgmentType = 'good';
      baseScore = GAME_CONSTANTS.SCORE.GOOD;
      accuracy = 0.5;
    } else {
      judgmentType = 'miss';
      baseScore = GAME_CONSTANTS.SCORE.MISS;
      accuracy = 0;
    }

    // コンボボーナス計算
    const comboMultiplier = this.calculateComboMultiplier();
    const finalScore = Math.floor(baseScore * comboMultiplier);

    return {
      type: judgmentType,
      timing,
      score: finalScore,
      accuracy,
    };
  }

  // ホールドノーツ終了判定
  private judgeHoldEnd(note: Note, timing: number): JudgmentResult {
    const absTiming = Math.abs(timing);
    
    // ホールドノーツは少し緩い判定
    const perfectWindow = GAME_CONSTANTS.JUDGMENT_TIMING.PERFECT * 1.5;
    const greatWindow = GAME_CONSTANTS.JUDGMENT_TIMING.GREAT * 1.5;
    const goodWindow = GAME_CONSTANTS.JUDGMENT_TIMING.GOOD * 1.5;
    
    let judgmentType: JudgmentResult['type'];
    let baseScore: number;
    let accuracy: number;
    
    if (absTiming <= perfectWindow) {
      judgmentType = 'perfect';
      baseScore = GAME_CONSTANTS.SCORE.PERFECT;
      accuracy = 1.0;
    } else if (absTiming <= greatWindow) {
      judgmentType = 'great';
      baseScore = GAME_CONSTANTS.SCORE.GREAT;
      accuracy = 0.8;
    } else if (absTiming <= goodWindow) {
      judgmentType = 'good';
      baseScore = GAME_CONSTANTS.SCORE.GOOD;
      accuracy = 0.5;
    } else {
      judgmentType = 'miss';
      baseScore = GAME_CONSTANTS.SCORE.MISS;
      accuracy = 0;
    }

    const comboMultiplier = this.calculateComboMultiplier();
    const finalScore = Math.floor(baseScore * comboMultiplier);

    return {
      type: judgmentType,
      timing,
      score: finalScore,
      accuracy,
    };
  }

  // コンボ倍率計算
  private calculateComboMultiplier(): number {
    const combo = this.gameState.combo;
    const threshold = GAME_CONSTANTS.SCORE.COMBO_BONUS_THRESHOLD;
    const maxMultiplier = GAME_CONSTANTS.SCORE.MAX_COMBO_MULTIPLIER;
    
    if (combo < threshold) {
      return 1.0;
    }
    
    // コンボ数に応じて線形増加
    const bonusRatio = Math.min((combo - threshold) / 100, 1.0);
    return 1.0 + (maxMultiplier - 1.0) * bonusRatio;
  }

  // 判定結果の適用
  private applyJudgmentResult(result: JudgmentResult): void {
    // スコア加算
    this.gameState.score += result.score;
    
    // 判定カウント更新
    this.gameState.judgments[result.type]++;
    
    // コンボ更新
    if (result.type === 'miss') {
      this.gameState.combo = 0;
    } else {
      this.gameState.combo++;
      this.gameState.maxCombo = Math.max(this.gameState.maxCombo, this.gameState.combo);
    }
  }

  // 統計更新
  private updateStatistics(): void {
    const totalJudgments = Object.values(this.gameState.judgments).reduce((sum, count) => sum + count, 0);
    
    if (totalJudgments === 0) {
      this.gameState.accuracy = 0;
      return;
    }
    
    const weightedAccuracy = (
      this.gameState.judgments.perfect * 1.0 +
      this.gameState.judgments.great * 0.8 +
      this.gameState.judgments.good * 0.5 +
      this.gameState.judgments.miss * 0.0
    ) / totalJudgments;
    
    this.gameState.accuracy = weightedAccuracy;
  }

  // ゲーム状態取得
  getGameState(): GameState {
    return { ...this.gameState };
  }

  // アクティブノーツ取得
  getActiveNotes(): Note[] {
    return Array.from(this.activeNotes.values());
  }

  // 表示用ノーツ取得（近づいてくるノーツ）
  getVisibleNotes(currentTime: number): Note[] {
    const approachTime = GAME_CONSTANTS.NOTES.APPROACH_TIME;
    
    return this.chart.notes.filter(note => {
      if (this.processedNotes.has(note.id)) return false;
      
      const timeToNote = note.startTime - currentTime;
      return timeToNote <= approachTime && timeToNote >= -100;
    });
  }

  // ゲーム開始
  startGame(): void {
    this.gameState.isPlaying = true;
    this.gameState.isPaused = false;
  }

  // ゲーム一時停止
  pauseGame(): void {
    this.gameState.isPaused = true;
    this.gameState.isPlaying = false;
  }

  // ゲーム再開
  resumeGame(): void {
    this.gameState.isPaused = false;
    this.gameState.isPlaying = true;
  }

  // ゲーム停止
  stopGame(): void {
    this.gameState.isPlaying = false;
    this.gameState.isPaused = false;
  }

  // ゲームリセット
  resetGame(): void {
    this.gameState = {
      isPlaying: false,
      isPaused: false,
      currentTime: 0,
      score: 0,
      combo: 0,
      maxCombo: 0,
      accuracy: 0,
      judgments: {
        perfect: 0,
        great: 0,
        good: 0,
        miss: 0,
      },
    };
    
    this.activeNotes.clear();
    this.processedNotes.clear();
  }

  // 進行率取得
  getProgress(): number {
    if (this.chart.totalDuration === 0) return 0;
    return Math.min(this.gameState.currentTime / this.chart.totalDuration, 1.0);
  }

  // 歌詞シンク率計算
  getLyricsSync(): number {
    const totalNotes = this.chart.notes.length;
    if (totalNotes === 0) return 1.0;
    
    const syncedNotes = this.gameState.judgments.perfect + this.gameState.judgments.great;
    return syncedNotes / totalNotes;
  }
} 