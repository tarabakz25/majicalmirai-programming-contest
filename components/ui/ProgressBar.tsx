import React from 'react'

interface ProgressBarProps {
  progress: number // 0-1の範囲
  className?: string
  showPercentage?: boolean
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className = '',
  showPercentage = false,
  color = 'blue',
}) => {
  const clampedProgress = Math.max(0, Math.min(1, progress))
  const percentage = Math.round(clampedProgress * 100)
  
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
  }
  
  return (
    <div className={`relative ${className}`}>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
          {percentage}%
        </div>
      )}
    </div>
  )
}
