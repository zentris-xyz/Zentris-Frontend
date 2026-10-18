import { cn } from '../../lib/utils'
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-8 w-full rounded border border-line bg-bg px-2.5 text-sm text-text tabnum',
        'placeholder:text-text-faint focus:border-line-strong focus:outline-none',
        className
      )}
      {...props}
    />
  )
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full resize-none rounded border border-line bg-bg p-3 text-sm leading-relaxed text-text',
        'placeholder:text-text-faint focus:border-line-strong focus:outline-none',
        className
      )}
      {...props}
    />
  )
}
