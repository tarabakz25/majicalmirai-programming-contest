export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-blue-900 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="relative mb-8">
          {/* メインローディングスピナー */}
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-blue-400 mx-auto"></div>

          {/* 内側のスピナー */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-400" style={{ animationDirection: 'reverse' }}></div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">楽曲を読み込み中...</h2>
        <p className="text-gray-300 mb-4">TextAlive APIから歌詞データを取得しています</p>

        {/* プログレスドット */}
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  )
}