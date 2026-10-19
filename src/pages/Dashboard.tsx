import { Link } from 'react-router-dom'
import { Plus, ArrowRight } from 'lucide-react'
import { StatStrip } from '../components/shared/StatStrip'
import { StrategyRow } from '../components/shared/StrategyRow'
import { Panel } from '../components/ui/Panel'
import { Button } from '../components/ui/Button'
import { StatusDot } from '../components/ui/StatusDot'
import { useActivity, useAssetBalances, useStrategies } from '../hooks/useSupra'
import { formatNumber, formatTokenAmount, relativeTime } from '../lib/utils'

export function Dashboard() {
  const { data: assets } = useAssetBalances()
  const { data: strategies } = useStrategies()
  const { data: activity } = useActivity()

  const active = (strategies ?? []).filter((s) => s.status === 'active')
  const totalValue = (assets ?? []).reduce((sum, a) => sum + a.valueUsd, 0)

  const supra = (assets ?? []).find((a) => a.symbol === 'SUPRA')
  const walletSupra = supra ? formatTokenAmount(supra.walletBalance, supra.decimals) : '0'
  const vaultSupra = supra ? formatTokenAmount(supra.vaultBalance, supra.decimals) : '0'

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Overview</h1>
          <p className="mt-1 text-sm text-text-muted">Autonomous DeFi strategies on Supra</p>
        </div>
        <Link to="/strategies/create">
          <Button>
            <Plus size={14} /> New strategy
          </Button>
        </Link>
      </div>

      <StatStrip
        items={[
          { label: 'Portfolio', value: `$${formatNumber(totalValue)}` },
          { label: 'SUPRA wallet', value: walletSupra },
          { label: 'SUPRA vault', value: vaultSupra },
          { label: 'Active', value: String(active.length) },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-text">Active strategies</h2>
            <Link
              to="/strategies"
              className="flex items-center gap-1 text-xs text-text-muted hover:text-text"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          <Panel className="overflow-hidden p-0">
            {active.length > 0 ? (
              active.slice(0, 3).map((s) => <StrategyRow key={s.id} strategy={s} />)
            ) : (
              <div className="px-4 py-10 text-center">
                <p className="text-sm text-text-muted">No active strategies.</p>
                <Link to="/strategies/create" className="mt-3 inline-block">
                  <Button size="sm">Create your first strategy</Button>
                </Link>
              </div>
            )}
          </Panel>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-text">Activity</h2>
            <Link
              to="/activity"
              className="flex items-center gap-1 text-xs text-text-muted hover:text-text"
            >
              All <ArrowRight size={12} />
            </Link>
          </div>
          <Panel className="overflow-hidden p-0">
            <ul className="divide-y divide-line">
              {(activity ?? []).slice(0, 5).map((a) => (
                <li key={a.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <StatusDot status={a.status} />
                        <span className="truncate text-sm text-text">{a.strategyName}</span>
                      </div>
                      <div className="mt-0.5 truncate font-mono text-2xs text-text-faint">
                        {a.txHash}
                      </div>
                    </div>
                    <span className="shrink-0 text-2xs text-text-faint">
                      {relativeTime(a.timestamp)}
                    </span>
                  </div>
                </li>
              ))}
              {(activity ?? []).length === 0 && (
                <li className="px-4 py-8 text-center text-xs text-text-faint">
                  No on-chain activity yet.
                </li>
              )}
            </ul>
          </Panel>
        </section>
      </div>
    </div>
  )
}
