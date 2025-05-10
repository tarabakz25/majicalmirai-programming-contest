import { Player, PlayerListener, IPhrase, IWord } from "textalive-app-api"
import { SongConfig } from "@/types/song"

let player: Player | null = null
let phrase: IPhrase | null = null

let mediaElementRef: React.RefObject<HTMLVideoElement> | null = null

export const initTextAlive = (config: SongConfig) => {
  if (player) {
    return
  }

  player = new Player()
  player.load(config.songUrl)
  
}