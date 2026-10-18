import { Pause, Play, X } from 'lucide-react'
import type { Strategy } from '../../types'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { formatNumber, relativeTime } from '../../lib/utils'

interface StrategyCardProps {
  strategy: Strategy
  onPause?: () => void
  onResume?: () => void
  onCancel?: () => void
}

export function StrategyCard({ strategy, onPause, onResume, onCancel }: StrategyCardProps) {
  const progress =
    strategy.action === 'BUY'
      ? strategy.currentPrice <= strategy.triggerPrice
        ? 100
        : Math.max(0, Math.min(100, (strategy.triggerPrice / strategy.currentPrice) * 100))
      : strategy.currentPrice >= strategy.triggerPrice
        ? 100
        : Math.max(0, Math.min(100, (strategy.currentPrice / strategy.triggerPrice) * 100))

  return (
    <Card className="hover:border-accent/30 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold">{strategy.name}</h3>
            <Badge
              variant={
                strategy.status === 'active' ? 'success'
                : strategy.status === 'executed' ? 'accent'
                : strategy.status === 'paused' ? 'warning'
                : 'neutral'
              }
            >
              {strategy.status}
            </Badge>
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-gray-400">{strategy.intent}</p>
        </div>
        <div className="flex gap-1">
          {strategy.status === 'active' && onPause && (
            <Button variant="ghost" size="sm" onClick={onPause} title="Pause"><Pause size={14} /></Button>
          )}
          {strategy.status === 'paused' && onResume && (
            <Button variant="ghost" size="sm" onClick={onResume} title="Resume"><Play size={14} /></Button>
          )}
          {strategy.status !== 'cancelled' && onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel} title="Cancel"><X size={14} /></Button>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
        <div>
          <div className="text-gray-500">Quantity</div>
          <div className="mt-0.5 font-mono font-medium">{formatNumber(strategy.quantity, 0)} {strategy.baseAsset}</div>
        </div>
        <div>
          <div className="text-gray-500">Trigger</div>
          <div className="mt-0.5 font-mono font-medium">${strategy.triggerPrice.toFixed(6)}</div>
        </div>
        <div>
          <div className="text-gray-500">Current</div>
          <div className="mt-0.5 font-mono font-medium text-accent-soft">${strategy.currentPrice.toFixed(6)}</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="h-1.5 overflow-hidden rounded-full bg-bg-elevated">
          <div className="h-full bg-gradient-to-r from-accent to-purple-400 transition-all" style={{ width: `${Math.min(100, Math.max(5, progress))}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-gray-500">
          <span>Created {relativeTime(strategy.createdAt)}</span>
          {strategy.lastExecuted && <span>Last run {relativeTime(strategy.lastExecuted)}</span>}
        </div>
      </div>
    </Card>
  )
}
