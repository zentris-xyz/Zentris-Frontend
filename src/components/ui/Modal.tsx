import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-t-lg border border-line bg-surface p-5 sm:rounded">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-md font-medium">{title}</h2>
          <button onClick={onClose} className="rounded p-1 text-text-muted hover:bg-raised hover:text-text">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
