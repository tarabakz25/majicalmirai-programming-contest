import React from 'react'

interface ScoreDisplayProps {
  score: number
  label?: string
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: string
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  score,
  label,
  className = '',
  size = 'md',
  color = 'text-white',
}) => {
  const formatScore = (score: number) => {
    return score.toLocaleString()
  }
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-4xl',
  }
  
  return (
    <div className={`text-center ${className}`}>
      {label && (
        <div className="text-xs text-gray-300 uppercase tracking-wide mb-1">
          {label}
        </div>
      )}
      <div className={`font-bold ${sizeClasses[size]} ${color}`}>
        {formatScore(score)}
      </div>
    </div>
  )
}
