// ゲーム定数定義
export const GAME_CONSTANTS = {
  // 判定タイミング (ms)
  JUDGMENT_TIMING: {
    PERFECT: 50,  // ±50ms
    GREAT: 100,   // ±100ms
    GOOD: 150,    // ±150ms
  },

  // スコア計算
  SCORE: {
    PERFECT: 1000,
    GREAT: 700,
    GOOD: 300,
    MISS: 0,
    COMBO_BONUS_THRESHOLD: 10,
    MAX_COMBO_MULTIPLIER: 2.0,
  },

  // レーン設定
  LANES: {
    PC_COUNT: 4,
    MOBILE_COUNT: 1,
    WIDTH: 100, // px
    HEIGHT: 600, // px
  },

  // ノーツ設定
  NOTES: {
    SPEED: 4, // ノーツ落下速度 (px/ms)
    HEIGHT: 20, // px
    APPROACH_TIME: 2000, // 2秒前から表示
  },

  // デフォルトキー設定
  DEFAULT_KEY_BINDING: {
    lane0: 'KeyA',
    lane1: 'KeyS',
    lane2: 'KeyD',
    lane3: 'KeyF',
  },

  // ローカルストレージキー
  STORAGE_KEYS: {
    CONFIG: 'lyricrails_config',
    SCORES: 'lyricrails_scores',
    BEST_SCORES: 'lyricrails_best_scores',
  },

  // 難易度設定
  DIFFICULTY: {
    EASY: {
      NOTE_DENSITY: 0.3,    // 30%のワードにノーツ配置
      LANE_DISTRIBUTION: 2, // 2レーンまで使用
    },
    NORMAL: {
      NOTE_DENSITY: 0.6,    // 60%のワードにノーツ配置
      LANE_DISTRIBUTION: 3, // 3レーンまで使用
    },
    HARD: {
      NOTE_DENSITY: 0.8,    // 80%のワードにノーツ配置
      LANE_DISTRIBUTION: 4, // 4レーン全使用
    },
  },
} as const;

// TextAlive設定
export const TEXTALIVE_CONFIG = {
  APP_OPTIONS: {
    // アプリケーショントークンは環境変数から取得
    app: {
      token: process.env.NEXT_PUBLIC_TEXTALIVE_API_KEY || "",
    },
  },
  
  // プレーヤーオプション
  PLAYER_OPTIONS: {
    mediaElement: null,
    mediaBannerPosition: "bottom right" as const,
  },
} as const;

// デバッグ設定
export const DEBUG = {
  SHOW_FPS: process.env.NODE_ENV === 'development',
  SHOW_TIMING: process.env.NODE_ENV === 'development',
  LOG_JUDGMENTS: process.env.NODE_ENV === 'development',
} as const; 