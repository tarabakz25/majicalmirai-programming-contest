import { useState, useEffect, useRef, useMemo } from "react"
import { Player } from "textalive-app-api"

export const useTextAlive = () => {
  const [player, setPlayer] = useState(null)
  const [app, setApp] = useState(null)
  const [phrase, setPhrase] = useState(null)
  const [mediaElement, setMediaElement] = useState(null)
  const mediaElementRef = useRef(null)

  useEffect(() => {
    const player = new Player({
      app: {
        token: process.env.NEXT_PUBLIC_TEXTALIVE_API_KEY || "",
      },
      mediaElement: mediaElementRef.current!,
    })
  })

  const playerListener = {
    onAppReady: () => {
      setApp(app)
    },
    onAppParamaterUpdate: (name: string, value: string) => {
      console.log(`App parameter updated: ${name} = ${value}`)
    },
    onVideoReady: () => {
        let phrase = player?.video?.firstPhrase

        while (phrase && phrase.next) {
          phrase.animate = (now, unit) => {
            if(unit.startTime <= now && unit.endTime> now) {
              setPhrase(unit.text)
            }
          }
          phrase = phrase.next
        }
    }
  }
}