import { cn } from '../../lib/utils'
import type { HTMLAttributes } from 'react'

export function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded border border-line bg-surface', className)} {...props} />
  )
}
