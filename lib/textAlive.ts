import { Player, PlayerListener, IPhrase, IWord, IVideo, LyricsInfo, LyricsBody } from "textalive-app-api"

export const initTextAlive = (mediaElement: HTMLElement) => {
  return new Player({
    app: { token: process.env.NEXT_PUBLIC_TEXTALIVE_API_KEY! },
    mediaElement,
  })
}

export const createTextAliveListener = (
  setPhrase: (phrase: any) => void,
  setPlayer: (player: Player) => void,
  setBeat: (beat: number) => void,
  delay: number,
): PlayerListener => ({
  onVideoReady: function(video: IVideo) {
    console.log("🎬 onVideoReady:", video)
  },
  onLyricsLoad: function(lyricsInfo: LyricsInfo, reason?: Error) {
    console.log("📖 onLyricsLoad:", lyricsInfo, reason)
  },
  onTextLoad: function(lyricsBody: LyricsBody, reason?: Error) {
    console.log("📝 onTextLoad:", lyricsBody, reason)
  },
  onTimerReady: function () {
    const video = this.video
    if (video && video.firstPhrase) {
      let phrase: IPhrase | null = video.firstPhrase
      while (phrase) {
      phrase.animate = (now: any, unit: any) => {
        if (unit.startTime - delay <= now && unit.endTime + delay > now) {
          setPhrase(unit)
        }
      }
        if (!phrase.next) break
      phrase = phrase.next
      }
    }
    setPlayer(this)
  },
  onTimeUpdate: function (position: any) {
    if(!this.video.findPhrase(position)) {
      setPhrase(undefined)
    }
    setBeat(this.findBeat(position + delay) ?? undefined)
  },
})