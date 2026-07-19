import { useState } from 'react'
import { cn } from '@/lib/utils'

const COLORS = [
  'bg-brand-soft text-brand',
  'bg-accent-soft text-accent',
  'bg-green-500/10 text-green-400',
  'bg-yellow-500/10 text-yellow-400',
  'bg-red-500/10 text-red-400',
  'bg-purple-500/10 text-purple-400',
  'bg-blue-500/10 text-blue-400',
  'bg-pink-500/10 text-pink-400',
]

export function CompanyAvatar({ name, logo, size = 'md' }) {
  const [imageError, setImageError] = useState(false)
  
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % COLORS.length
  const colorClass = COLORS[colorIndex]

  const sizeClasses = {
    sm: 'size-6 text-xs',
    md: 'size-8 text-sm',
    lg: 'size-10 text-base',
    xl: 'size-12 text-lg',
  }

  if (logo && !imageError) {
    return (
      <img
        src={logo}
        alt={name}
        className={cn('rounded-lg object-cover ring-1 ring-hairline', sizeClasses[size])}
        onError={() => setImageError(true)}
      />
    )
  }

  return (
    <div
      className={cn(
        'rounded-lg flex items-center justify-center font-semibold ring-1 ring-hairline',
        sizeClasses[size],
        colorClass
      )}
      aria-label={name}
    >
      {initials}
    </div>
  )
}