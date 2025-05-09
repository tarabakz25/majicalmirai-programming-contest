import { Player } from "textalive-app-api"
import { SongConfig } from "../types/song"

let player: Player

export function initTextAlive(onReady: (player: Player) => void) {
	player = new Player({
		app: { token: process.env.NEXT_PUBLIC_TEXTALIVE_API_KEY! },
	})
	player.addListener({
		onReady: (app: any) => {
			player = app.player
			onReady(player)
		},
	})
}

export async function loadSong(config: SongConfig) {
	if (!player) throw new Error("TextAlive player is not initialized")
	await player.createFromSongUrl(config.songUrl, { video: config.video })
}
