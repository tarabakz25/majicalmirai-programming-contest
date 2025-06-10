import React from 'react'
import { Note } from '@/types/game'

interface NoteComponentProps {
  note: Note
  position: { x: number; y: number }
  size: { width: number; height: number }
  isActive: boolean
}

export const NoteComponent: React.FC<NoteComponentProps> = ({
  note,
  position,
  size,
  isActive,
}) => {
  const getNoteColor = () => {
    switch (note.type) {
      case 'tap':
        return isActive ? '#FFD700' : '#4A90E2'
      case 'hold':
        return isActive ? '#FFA500' : '#F5A623'
      case 'slide':
        return isActive ? '#90EE90' : '#7ED321'
      default:
        return '#4A90E2'
    }
  }

  const getNoteStyle = () => {
    const baseStyle = {
      position: 'absolute' as const,
      left: position.x - size.width / 2,
      top: position.y - size.height / 2,
      width: size.width,
      height: size.height,
      backgroundColor: getNoteColor(),
      border: '2px solid #FFFFFF',
      borderRadius: note.type === 'tap' ? '50%' : '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#FFFFFF',
      fontSize: '12px',
      fontWeight: 'bold',
      transition: 'all 0.1s ease',
      transform: isActive ? 'scale(1.1)' : 'scale(1)',
      boxShadow: isActive ? '0 0 20px rgba(255, 255, 255, 0.8)' : 'none',
    }

    return baseStyle
  }

  return (
    <div style={getNoteStyle()}>
      {note.word && (
        <span className="text-xs text-white font-bold">
          {note.word.slice(0, 3)}
        </span>
      )}
    </div>
  )
}