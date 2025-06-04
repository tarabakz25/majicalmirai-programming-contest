import { Player } from 'textalive-app-api'
import { useEffect, useState, createRef, useMemo} from 'react'

export const useTextalive = () => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [app, setApp] = useState(null);
  const [char, setChar] = useState<string[]>([]);
  const 
}