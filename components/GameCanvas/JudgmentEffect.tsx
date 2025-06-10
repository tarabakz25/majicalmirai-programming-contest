import React, { useEffect, useState } from 'react'

interface JudgmentEffectProps {
  type: string
  lane: number
  onComplete: () => void
}

export const JudgmentEffect: React.FC<JudgmentEffectProps> = ({
  type,
  lane,
  onComplete,
}) => {
  const [opacity, setOpacity] = useState(1)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpacity(0)
      setScale(1.5)
    }, 100)

    const completeTimer = setTimeout(() => {
      onComplete()
    }, 500)

    return () => {
      clearTimeout(timer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  const getEffectStyle = () => {
    const laneWidth = 200 // 仮の値、実際のレーン幅に合わせる
    const x = lane * laneWidth + laneWidth / 2

    return {
      position: 'absolute' as const,
      left: x - 50,
      bottom: 100,
      width: 100,
      height: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity,
      transform: `scale(${scale})`,
      transition: 'all 0.4s ease-out',
      pointerEvents: 'none' as const,
      zIndex: 1000,
    }
  }

  const getEffectText = () => {
    switch (type) {
      case 'perfect':
        return { text: 'PERFECT!', color: '#FFD700' }
      case 'great':
        return { text: 'GREAT!', color: '#00FF00' }
      case 'good':
        return { text: 'GOOD', color: '#0080FF' }
      case 'miss':
        return { text: 'MISS', color: '#FF0000' }
      default:
        return { text: 'HIT!', color: '#FFFFFF' }
    }
  }

  const { text, color } = getEffectText()

  return (
    <div style={getEffectStyle()}>
      <span
        style={{
          color,
          fontSize: '18px',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
        }}
      >
        {text}
      </span>
    </div>
  )
}
