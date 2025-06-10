import { songList } from '@/data/songs'
import PlayPageClient from './PlayPageClient'

// 静的エクスポート用のパラメータ生成
export async function generateStaticParams() {
  return songList.map((song) => ({
    songId: song.songUrl.split('/').pop()?.split('?')[0] || song.songUrl,
  }))
}

export default function PlayPage() {
  return <PlayPageClient />
}