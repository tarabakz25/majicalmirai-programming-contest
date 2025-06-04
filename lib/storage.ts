import { GameConfig, ScoreRecord } from '@/types/game';
import { GAME_CONSTANTS } from './constants';

// ローカルストレージ管理クラス
export class StorageManager {
  // デフォルト設定取得
  static getDefaultConfig(): GameConfig {
    return {
      keyBinding: GAME_CONSTANTS.DEFAULT_KEY_BINDING,
      volume: 0.8,
      showDebug: false,
      judgmentTiming: GAME_CONSTANTS.JUDGMENT_TIMING,
    };
  }

  // 設定の読み込み
  static loadConfig(): GameConfig {
    try {
      const stored = localStorage.getItem(GAME_CONSTANTS.STORAGE_KEYS.CONFIG);
      if (!stored) {
        return this.getDefaultConfig();
      }

      const config = JSON.parse(stored) as GameConfig;
      
      // バリデーション
      if (!this.validateConfig(config)) {
        console.warn('設定データが無効です。デフォルト設定を使用します。');
        return this.getDefaultConfig();
      }

      return config;
    } catch (error) {
      console.error('設定の読み込みに失敗しました:', error);
      return this.getDefaultConfig();
    }
  }

  // 設定の保存
  static saveConfig(config: GameConfig): boolean {
    try {
      if (!this.validateConfig(config)) {
        console.error('無効な設定データです');
        return false;
      }

      localStorage.setItem(GAME_CONSTANTS.STORAGE_KEYS.CONFIG, JSON.stringify(config));
      return true;
    } catch (error) {
      console.error('設定の保存に失敗しました:', error);
      return false;
    }
  }

  // 設定のバリデーション
  static validateConfig(config: any): config is GameConfig {
    if (!config || typeof config !== 'object') return false;
    
    // キーバインディングチェック
    if (!config.keyBinding || typeof config.keyBinding !== 'object') return false;
    const requiredKeys = ['lane0', 'lane1', 'lane2', 'lane3'];
    for (const key of requiredKeys) {
      if (typeof config.keyBinding[key] !== 'string') return false;
    }

    // 音量チェック
    if (typeof config.volume !== 'number' || config.volume < 0 || config.volume > 1) return false;

    // デバッグ表示チェック
    if (typeof config.showDebug !== 'boolean') return false;

    // 判定タイミングチェック
    if (!config.judgmentTiming || typeof config.judgmentTiming !== 'object') return false;
    const timingKeys = ['perfect', 'great', 'good'];
    for (const key of timingKeys) {
      if (typeof config.judgmentTiming[key] !== 'number' || config.judgmentTiming[key] <= 0) {
        return false;
      }
    }

    return true;
  }

  // スコアの保存
  static saveScore(score: ScoreRecord): boolean {
    try {
      const scores = this.loadScores();
      scores.push(score);

      // 曲ごとに最新20件まで保持
      const songScores = scores.filter(s => s.songId === score.songId);
      songScores.sort((a, b) => b.timestamp - a.timestamp);
      const limitedSongScores = songScores.slice(0, 20);

      // 他の曲のスコアと結合
      const otherScores = scores.filter(s => s.songId !== score.songId);
      const finalScores = [...otherScores, ...limitedSongScores];

      localStorage.setItem(GAME_CONSTANTS.STORAGE_KEYS.SCORES, JSON.stringify(finalScores));
      
      // ベストスコアの更新
      this.updateBestScore(score);
      
      return true;
    } catch (error) {
      console.error('スコアの保存に失敗しました:', error);
      return false;
    }
  }

  // スコア一覧の読み込み
  static loadScores(): ScoreRecord[] {
    try {
      const stored = localStorage.getItem(GAME_CONSTANTS.STORAGE_KEYS.SCORES);
      if (!stored) return [];

      const scores = JSON.parse(stored) as ScoreRecord[];
      return scores.filter(score => this.validateScore(score));
    } catch (error) {
      console.error('スコアの読み込みに失敗しました:', error);
      return [];
    }
  }

  // 曲別スコア取得
  static getScoresBySong(songId: string): ScoreRecord[] {
    const allScores = this.loadScores();
    return allScores
      .filter(score => score.songId === songId)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  // ベストスコア更新
  static updateBestScore(newScore: ScoreRecord): void {
    try {
      const bestScores = this.loadBestScores();
      const existingBest = bestScores.find(score => score.songId === newScore.songId);

      if (!existingBest || newScore.score > existingBest.score) {
        // 新記録
        const updatedBestScores = bestScores.filter(score => score.songId !== newScore.songId);
        updatedBestScores.push(newScore);
        
        localStorage.setItem(GAME_CONSTANTS.STORAGE_KEYS.BEST_SCORES, JSON.stringify(updatedBestScores));
      }
    } catch (error) {
      console.error('ベストスコアの更新に失敗しました:', error);
    }
  }

  // ベストスコア読み込み
  static loadBestScores(): ScoreRecord[] {
    try {
      const stored = localStorage.getItem(GAME_CONSTANTS.STORAGE_KEYS.BEST_SCORES);
      if (!stored) return [];

      const scores = JSON.parse(stored) as ScoreRecord[];
      return scores.filter(score => this.validateScore(score));
    } catch (error) {
      console.error('ベストスコアの読み込みに失敗しました:', error);
      return [];
    }
  }

  // 曲のベストスコア取得
  static getBestScore(songId: string): ScoreRecord | null {
    const bestScores = this.loadBestScores();
    return bestScores.find(score => score.songId === songId) || null;
  }

  // スコアのバリデーション
  static validateScore(score: any): score is ScoreRecord {
    if (!score || typeof score !== 'object') return false;
    
    if (typeof score.songId !== 'string') return false;
    if (typeof score.score !== 'number' || score.score < 0) return false;
    if (typeof score.accuracy !== 'number' || score.accuracy < 0 || score.accuracy > 1) return false;
    if (typeof score.maxCombo !== 'number' || score.maxCombo < 0) return false;
    if (typeof score.timestamp !== 'number') return false;
    if (typeof score.lyricsSync !== 'number' || score.lyricsSync < 0 || score.lyricsSync > 1) return false;

    if (!score.judgments || typeof score.judgments !== 'object') return false;
    const judgmentKeys = ['perfect', 'great', 'good', 'miss'];
    for (const key of judgmentKeys) {
      if (typeof score.judgments[key] !== 'number' || score.judgments[key] < 0) {
        return false;
      }
    }

    return true;
  }

  // データクリア
  static clearAllData(): void {
    try {
      localStorage.removeItem(GAME_CONSTANTS.STORAGE_KEYS.CONFIG);
      localStorage.removeItem(GAME_CONSTANTS.STORAGE_KEYS.SCORES);
      localStorage.removeItem(GAME_CONSTANTS.STORAGE_KEYS.BEST_SCORES);
      console.log('全データをクリアしました');
    } catch (error) {
      console.error('データのクリアに失敗しました:', error);
    }
  }

  // データエクスポート
  static exportData(): string {
    try {
      const data = {
        config: this.loadConfig(),
        scores: this.loadScores(),
        bestScores: this.loadBestScores(),
        exportDate: new Date().toISOString(),
      };
      
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('データのエクスポートに失敗しました:', error);
      throw error;
    }
  }

  // データインポート
  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.config && this.validateConfig(data.config)) {
        this.saveConfig(data.config);
      }
      
      if (Array.isArray(data.scores)) {
        const validScores = data.scores.filter((score: any) => this.validateScore(score));
        localStorage.setItem(GAME_CONSTANTS.STORAGE_KEYS.SCORES, JSON.stringify(validScores));
      }
      
      if (Array.isArray(data.bestScores)) {
        const validBestScores = data.bestScores.filter((score: any) => this.validateScore(score));
        localStorage.setItem(GAME_CONSTANTS.STORAGE_KEYS.BEST_SCORES, JSON.stringify(validBestScores));
      }
      
      return true;
    } catch (error) {
      console.error('データのインポートに失敗しました:', error);
      return false;
    }
  }

  // 統計情報取得
  static getStatistics(): {
    totalPlays: number;
    totalScore: number;
    averageAccuracy: number;
    favoriteSong: string | null;
    playTime: number; // 推定プレイ時間（分）
  } {
    const scores = this.loadScores();
    
    if (scores.length === 0) {
      return {
        totalPlays: 0,
        totalScore: 0,
        averageAccuracy: 0,
        favoriteSong: null,
        playTime: 0,
      };
    }

    const totalScore = scores.reduce((sum, score) => sum + score.score, 0);
    const averageAccuracy = scores.reduce((sum, score) => sum + score.accuracy, 0) / scores.length;
    
    // 最も多くプレイされた曲
    const songCounts = scores.reduce((counts, score) => {
      counts[score.songId] = (counts[score.songId] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    const favoriteSong = Object.entries(songCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || null;

    // 推定プレイ時間（1プレイ = 約3分と仮定）
    const playTime = scores.length * 3;

    return {
      totalPlays: scores.length,
      totalScore,
      averageAccuracy,
      favoriteSong,
      playTime,
    };
  }
}

// 便利関数
export const useGameConfig = (): [GameConfig, (config: GameConfig) => void] => {
  const config = StorageManager.loadConfig();
  
  const setConfig = (newConfig: GameConfig) => {
    StorageManager.saveConfig(newConfig);
  };
  
  return [config, setConfig];
};

export const useScores = (songId?: string): {
  scores: ScoreRecord[];
  bestScore: ScoreRecord | null;
  saveScore: (score: ScoreRecord) => boolean;
} => {
  const scores = songId ? StorageManager.getScoresBySong(songId) : StorageManager.loadScores();
  const bestScore = songId ? StorageManager.getBestScore(songId) : null;
  
  return {
    scores,
    bestScore,
    saveScore: StorageManager.saveScore,
  };
}; 