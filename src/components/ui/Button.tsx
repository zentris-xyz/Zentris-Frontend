import { cn } from '../../lib/utils'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded font-medium transition-colors',
        'focus:outline-none focus-visible:ring-1 focus-visible:ring-accent/60',
        'disabled:cursor-not-allowed disabled:opacity-40',
        {
          'bg-accent text-black hover:bg-accent/90': variant === 'primary',
          'border border-line bg-surface text-text hover:bg-raised': variant === 'secondary',
          'text-text-muted hover:bg-raised hover:text-text': variant === 'ghost',
          'border border-danger/40 text-danger hover:bg-danger/10': variant === 'danger',
          'h-7 px-2.5 text-xs': size === 'sm',
          'h-8 px-3 text-sm': size === 'md',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
