import { cn } from '../../lib/utils'
import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'success' | 'warning' | 'danger' | 'neutral' | 'accent'
}

export function Badge({ children, variant = 'neutral' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        {
          'bg-green-500/10 text-green-400 border border-green-500/20': variant === 'success',
          'bg-amber-500/10 text-amber-400 border border-amber-500/20': variant === 'warning',
          'bg-red-500/10 text-red-400 border border-red-500/20': variant === 'danger',
          'bg-gray-500/10 text-gray-400 border border-gray-500/20': variant === 'neutral',
          'bg-accent/10 text-accent-soft border border-accent/20': variant === 'accent',
        }
      )}
    >
      {children}
    </span>
  )
}
