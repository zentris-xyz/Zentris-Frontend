import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { StrategyRow } from '../components/shared/StrategyRow'
import { Panel } from '../components/ui/Panel'
import { Button } from '../components/ui/Button'
import { useStrategies } from '../hooks/useSupra'
import { useWallet } from '../context/WalletContext'
import { cancelStrategyOnChain } from '../lib/supra'
import type { StrategyStatus } from '../types'
import { cn } from '../lib/utils'

const filters: { label: string; value: StrategyStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Executed', value: 'executed' },
  { label: 'Cancelled', value: 'cancelled' },
]

export function Strategies() {
  const { address } = useWallet()
  const { data: strategies, loading, refresh } = useStrategies()
  const [filter, setFilter] = useState<StrategyStatus | 'all'>('all')

  const filtered = (strategies ?? []).filter((s) => filter === 'all' || s.status === filter)

  const handleCancel = async (id: string) => {
    if (!address) return
    const strategy = (strategies ?? []).find((s) => s.id === id)
    if (!strategy) return
    const baseCoinType = strategy.baseAsset === 'SUPRA'
      ? '0x1::supra_coin::SupraCoin'
      : ''
    const quoteCoinType = import.meta.env.VITE_USDC_COIN_TYPE ?? ''
    if (!baseCoinType || !quoteCoinType) return
    await cancelStrategyOnChain({ owner: address, baseCoinType, quoteCoinType })
    await refresh()
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Strategies</h1>
          <p className="mt-1 text-sm text-text-muted">Manage your autonomous strategies</p>
        </div>
        <Link to="/strategies/create">
          <Button><Plus size={14} /> New</Button>
        </Link>
      </div>

      <div className="flex items-center gap-1 border-b border-line">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'relative px-3 py-2 text-xs transition-colors',
              filter === f.value ? 'text-text' : 'text-text-muted hover:text-text',
            )}
          >
            {f.label}
            {filter === f.value && <span className="absolute inset-x-2 -bottom-px h-px bg-accent" />}
          </button>
        ))}
      </div>

      <Panel className="overflow-hidden p-0">
        <div className="hidden grid-cols-[110px_1fr_110px_110px_120px_32px] gap-4 border-b border-line px-4 py-2 text-2xs uppercase tracking-wider text-text-faint md:grid">
          <div>Status</div>
          <div>Strategy</div>
          <div>Trigger</div>
          <div>Current</div>
          <div>Progress</div>
          <div />
        </div>

        {loading ? (
          <div className="px-4 py-10 text-center text-xs text-text-faint">Loading strategies…</div>
        ) : filtered.length > 0 ? (
          filtered.map((s) => (
            <StrategyRow key={s.id} strategy={s} onCancel={() => void handleCancel(s.id)} />
          ))
        ) : (
          <div className="px-4 py-16 text-center">
            <p className="text-sm text-text-muted">No strategies match this filter.</p>
            <Link to="/strategies/create" className="mt-3 inline-block">
              <Button size="sm">Create strategy</Button>
            </Link>
          </div>
        )}
      </Panel>
    </div>
  )
}
