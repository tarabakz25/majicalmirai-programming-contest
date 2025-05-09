"use client"

import { createContext, useContext, useEffect, useState, useRef } from "react"
import { IWord, IPhrase, Player, PlayerListener } from "textalive-app-api"

import { SongConfig } from "@/types/song"


export const TextAliveProvider = ({
	children,
}: {
	children: React.ReactNode
}) => {
	const [player, setPlayer] = useState<Player | null>(null)
	const mediaElementRef = useRef<HTMLVideoElement>(null)
	const [phrase, setPhrase] = useState<IPhrase | null>(null)

	let delay = 100

	useEffect(() => {
		const player = new Player({
			app: {
				token: process.env.NEXT_PUBLIC_TEXTALIVE_API_KEY || "",
			},
			mediaElement: mediaElementRef.current!,
		})
	})

	const playerListener: PlayerListener = {
		onTimerReady: () => {
			let phrase = player?.video?.firstPhrase

			while (phrase) {
				phrase.animate = (now, unit) => {
					if (
						unit.startTime - delay <= now &&
						unit.endTime - delay > now
					) {
						setPhrase(unit as IPhrase)
					}
				}

				if (phrase.next === null) break

				phrase = phrase.next
			}

			setPlayer(player)
		},
	}

  
}
