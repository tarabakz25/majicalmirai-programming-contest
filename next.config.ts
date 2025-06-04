import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 静的サイト生成
  output: "export",
  
  // 画像最適化の無効化（静的エクスポート時）
  images: {
    unoptimized: true,
  },
  
  // trailingSlashの設定
  trailingSlash: true,
  
  // ベースパスの設定（GitHub Pages用、必要に応じて）
  // basePath: process.env.NODE_ENV === 'production' ? '/majicalmirai-programming-contest' : '',
  
  // アセットプレフィックス
  // assetPrefix: process.env.NODE_ENV === 'production' ? '/majicalmirai-programming-contest' : '',
  
  // 外部依存関係の最適化
  experimental: {
    optimizePackageImports: ['textalive-app-api'],
  },
  
  // TypeScript設定
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ESLint設定
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // パフォーマンス最適化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // ヘッダー設定
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
