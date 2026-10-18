import { useState } from 'react'
import { MoreHorizontal, Pause, Play, X } from 'lucide-react'
import type { Strategy } from '../../types'
import { StatusDot } from '../ui/StatusDot'
import { cn } from '../../lib/utils'

interface Props {
  strategy: Strategy
  onPause?: () => void
  onResume?: () => void
  onCancel?: () => void
}

export function StrategyRow({ strategy, onPause, onResume, onCancel }: Props) {
  const [menu, setMenu] = useState(false)

  const progress =
    strategy.action === 'BUY'
      ? strategy.currentPrice <= strategy.triggerPrice
        ? 100
        : Math.max(2, Math.min(100, (strategy.triggerPrice / strategy.currentPrice) * 100))
      : strategy.currentPrice >= strategy.triggerPrice
        ? 100
        : Math.max(2, Math.min(100, (strategy.currentPrice / strategy.triggerPrice) * 100))

  return (
    <div className="border-b border-line last:border-b-0">
      {/* Desktop row */}
      <div className="hidden items-center gap-4 px-4 py-3 text-sm md:grid md:grid-cols-[110px_1fr_110px_110px_120px_32px]">
        <div className="flex items-center gap-2 text-text-muted">
          <StatusDot status={strategy.status} />
          <span className="capitalize text-xs">{strategy.status}</span>
        </div>
        <div className="min-w-0">
          <div className="truncate text-text">{strategy.name}</div>
          <div className="truncate text-xs text-text-faint">{strategy.intent}</div>
        </div>
        <div className="font-mono text-xs text-text-muted tabnum">${strategy.triggerPrice.toFixed(6)}</div>
        <div className="font-mono text-xs text-text tabnum">${strategy.currentPrice.toFixed(6)}</div>
        <div>
          <div className="h-1 w-full bg-raised">
            <div
              className={cn('h-full', progress >= 100 ? 'bg-accent' : 'bg-line-strong')}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-1 text-2xs text-text-faint tabnum">{Math.round(progress)}% to trigger</div>
        </div>
        <div className="relative">
          <button
            onClick={() => setMenu(!menu)}
            className="flex h-7 w-7 items-center justify-center rounded text-text-muted hover:bg-raised hover:text-text"
          >
            <MoreHorizontal size={14} />
          </button>
          {menu && (
            <div className="absolute right-0 top-full z-10 mt-1 w-32 rounded border border-line bg-surface py-1 shadow-lg shadow-black/40">
              {strategy.status === 'active' && onPause && (
                <button onClick={() => { onPause(); setMenu(false) }} className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-text-muted hover:bg-raised hover:text-text">
                  <Pause size={12} /> Pause
                </button>
              )}
              {strategy.status === 'paused' && onResume && (
                <button onClick={() => { onResume(); setMenu(false) }} className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-text-muted hover:bg-raised hover:text-text">
                  <Play size={12} /> Resume
                </button>
              )}
              {onCancel && (
                <button onClick={() => { onCancel(); setMenu(false) }} className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-danger hover:bg-danger/10">
                  <X size={12} /> Cancel
                </button>
              )}
            </div>
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
          <div className="flex gap-1">
            {strategy.status === 'active' && onPause && (
              <button onClick={onPause} className="flex h-7 w-7 items-center justify-center rounded border border-line text-text-muted hover:bg-raised">
                <Pause size={12} />
              </button>
            )}
            {strategy.status === 'paused' && onResume && (
              <button onClick={onResume} className="flex h-7 w-7 items-center justify-center rounded border border-line text-text-muted hover:bg-raised">
                <Play size={12} />
              </button>
            )}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="text-text-faint">Trigger</div>
            <div className="mt-0.5 font-mono text-text-muted tabnum">${strategy.triggerPrice.toFixed(6)}</div>
          </div>
          <div>
            <div className="text-text-faint">Current</div>
            <div className="mt-0.5 font-mono text-text tabnum">${strategy.currentPrice.toFixed(6)}</div>
          </div>
        </div>
        <div className="mt-3 h-1 w-full bg-raised">
          <div className={cn('h-full', progress >= 100 ? 'bg-accent' : 'bg-line-strong')} style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  )
}
