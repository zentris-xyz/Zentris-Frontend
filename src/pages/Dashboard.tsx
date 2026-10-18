import { Link } from 'react-router-dom'
import { Plus, ArrowRight } from 'lucide-react'
import { StatStrip } from '../components/shared/StatStrip'
import { StrategyRow } from '../components/shared/StrategyRow'
import { Panel } from '../components/ui/Panel'
import { Button } from '../components/ui/Button'
import { StatusDot } from '../components/ui/StatusDot'
import { mockStrategies, mockActivity, portfolioStats } from '../lib/mock'
import { relativeTime } from '../lib/utils'

export function Dashboard() {
  const active = mockStrategies.filter((s) => s.status === 'active')

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
          { label: 'Portfolio', value: `$${portfolioStats.totalValue.toFixed(2)}`, delta: '+2.4% 24h', positive: true },
          { label: 'Active', value: String(portfolioStats.activeStrategies) },
          { label: 'Executions', value: String(portfolioStats.totalExecutions), delta: '+3 today', positive: true },
          { label: 'Est. APY', value: '4.2%', delta: '+0.3%', positive: true },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-text">Active strategies</h2>
            <Link to="/strategies" className="flex items-center gap-1 text-xs text-text-muted hover:text-text">
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
            <Link to="/activity" className="flex items-center gap-1 text-xs text-text-muted hover:text-text">
              All <ArrowRight size={12} />
            </Link>
          </div>
          <Panel className="overflow-hidden p-0">
            <ul className="divide-y divide-line">
              {mockActivity.slice(0, 5).map((a) => (
                <li key={a.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <StatusDot status={a.status} />
                        <span className="truncate text-sm text-text">{a.strategyName}</span>
                      </div>
                      <div className="mt-0.5 text-xs text-text-faint">
                        {a.amount ? `${a.amount}` : 'Strategy registered'}
                        {a.price ? <span className="font-mono"> · ${a.price.toFixed(6)}</span> : null}
                      </div>
                    </div>
                    <span className="shrink-0 text-2xs text-text-faint">{relativeTime(a.timestamp)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </section>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-text">Try natural language</h2>
        </div>
        <Panel className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="max-w-xl text-sm text-text-muted">
              Describe a strategy in plain English. Zentris parses it into on-chain logic and registers it with Supra AutoFi.
            </p>
            <Link to="/strategies/create" className="shrink-0">
              <Button variant="secondary">Open editor</Button>
            </Link>
          </div>
        </Panel>
      </section>
    </div>
  )
}
