import { useEffect, useRef, useState } from 'react'
import { MoreHorizontal, X } from 'lucide-react'
import type { Strategy } from '../../types'
import { StatusDot } from '../ui/StatusDot'
import { cn } from '../../lib/utils'

interface Props {
  strategy: Strategy
  onCancel?: () => void
}

export function StrategyRow({ strategy, onCancel }: Props) {
  const [menu, setMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menu) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenu(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenu(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [menu])

  const hasCurrentPrice = Number.isFinite(strategy.currentPrice) && strategy.currentPrice > 0
  const hasTriggerPrice = Number.isFinite(strategy.triggerPrice) && strategy.triggerPrice > 0
  const canShowProgress = strategy.status === 'active' && hasCurrentPrice && hasTriggerPrice

  let progress = 0
  if (canShowProgress) {
    if (strategy.action === 'BUY') {
      progress =
        strategy.currentPrice <= strategy.triggerPrice
          ? 100
          : Math.max(2, Math.min(100, (strategy.triggerPrice / strategy.currentPrice) * 100))
    } else {
      progress =
        strategy.currentPrice >= strategy.triggerPrice
          ? 100
          : Math.max(2, Math.min(100, (strategy.currentPrice / strategy.triggerPrice) * 100))
    }
  }

  const canCancel = strategy.status === 'active' && !!onCancel
  const showMenu = canCancel

  const priceDisplay = (value: number) =>
    Number.isFinite(value) && value > 0 ? `$${value.toFixed(6)}` : '—'

  const statusLabel: Record<Strategy['status'], string> = {
    active: 'Active',
    executed: 'Executed',
    cancelled: 'Cancelled',
    paused: 'Paused',
  }

  return (
    <div className="border-b border-line last:border-b-0">
      {/* Desktop row */}
      <div className="hidden items-center gap-4 px-4 py-3 text-sm md:grid md:grid-cols-[110px_1fr_110px_110px_120px_32px]">
        <div className="flex items-center gap-2 text-text-muted">
          <StatusDot status={strategy.status} />
          <span className="text-xs">{statusLabel[strategy.status]}</span>
        </div>

        <div className="min-w-0">
          <div className="truncate text-text">{strategy.name}</div>
          <div className="truncate text-xs text-text-faint">{strategy.intent}</div>
        </div>

        <div className="font-mono text-xs text-text-muted tabnum">
          {priceDisplay(strategy.triggerPrice)}
        </div>

        <div className="font-mono text-xs text-text tabnum">
          {priceDisplay(strategy.currentPrice)}
        </div>

        <div>
          {canShowProgress ? (
            <>
              <div className="h-1 w-full bg-raised">
                <div
                  className={cn('h-full', progress >= 100 ? 'bg-accent' : 'bg-line-strong')}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-1 text-2xs text-text-faint tabnum">
                {Math.round(progress)}% to trigger
              </div>
            </>
          ) : (
            <div className="text-2xs text-text-faint">
              {strategy.status === 'executed'
                ? 'Filled'
                : strategy.status === 'cancelled'
                  ? '—'
                  : 'Awaiting price'}
            </div>
          )}
        </div>

        <div className="relative" ref={menuRef}>
          {showMenu ? (
            <>
              <button
                onClick={() => setMenu((v) => !v)}
                className="flex h-7 w-7 items-center justify-center rounded text-text-muted hover:bg-raised hover:text-text"
                aria-label="Strategy actions"
              >
                <MoreHorizontal size={14} />
              </button>
              {menu && (
                <div className="absolute right-0 top-full z-10 mt-1 w-32 rounded border border-line bg-surface py-1 shadow-lg shadow-black/40">
                  <button
                    onClick={() => {
                      onCancel?.()
                      setMenu(false)
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-danger hover:bg-danger/10"
                  >
                    <X size={12} /> Cancel
                  </button>
                </div>
              )}
            </>
          ) : (
            <span className="block h-7 w-7" />
          )}
        </div>
      </div>

      {/* Mobile stacked */}
      <div className="px-4 py-3 md:hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <StatusDot status={strategy.status} />
              <span className="truncate text-sm text-text">{strategy.name}</span>
            </div>
            <div className="mt-0.5 line-clamp-1 text-xs text-text-faint">{strategy.intent}</div>
          </div>
          {canCancel && (
            <button
              onClick={() => onCancel?.()}
              className="flex h-7 w-7 items-center justify-center rounded border border-line text-danger hover:bg-danger/10"
              aria-label="Cancel strategy"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="text-text-faint">Trigger</div>
            <div className="mt-0.5 font-mono text-text-muted tabnum">
              {priceDisplay(strategy.triggerPrice)}
            </div>
          </div>
          <div>
            <div className="text-text-faint">Current</div>
            <div className="mt-0.5 font-mono text-text tabnum">
              {priceDisplay(strategy.currentPrice)}
            </div>
          </div>
        </div>

        {canShowProgress && (
          <div className="mt-3 h-1 w-full bg-raised">
            <div
              className={cn('h-full', progress >= 100 ? 'bg-accent' : 'bg-line-strong')}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
