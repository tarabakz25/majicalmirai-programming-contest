"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error('Play page error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-black bg-opacity-50 rounded-lg p-8 max-w-md w-full text-center text-white">
        <div className="text-6xl mb-4">😵</div>
        <h2 className="text-2xl font-bold mb-4">エラーが発生しました</h2>
        <p className="text-gray-300 mb-6">
          ゲームの読み込み中に問題が発生しました。
        </p>
        
        <div className="space-y-4">
          <button
            onClick={reset}
            className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-bold"
          >
            再試行
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="w-full px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-bold"
          >
            ホームに戻る
          </button>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-400">
              エラー詳細 (開発用)
            </summary>
            <pre className="mt-2 text-xs text-red-400 bg-gray-900 p-2 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}
