import { ExternalLink } from 'lucide-react'
import { Panel } from '../components/ui/Panel'
import { StatusDot } from '../components/ui/StatusDot'
import { mockActivity } from '../lib/mock'
import { relativeTime } from '../lib/utils'

export function Activity() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Activity</h1>
        <p className="mt-1 text-sm text-text-muted">Verifiable on-chain</p>
      </div>

      <Panel className="overflow-hidden p-0">
        <div className="hidden grid-cols-[110px_1fr_160px_160px_140px_100px] gap-4 border-b border-line px-4 py-2 text-2xs uppercase tracking-wider text-text-faint md:grid">
          <div>Status</div>
          <div>Strategy</div>
          <div>Amount</div>
          <div>Price</div>
          <div>Tx</div>
          <div className="text-right">Time</div>
        </div>

        <ul className="divide-y divide-line">
          {mockActivity.map((a) => (
            <li key={a.id}>
              <div className="hidden grid-cols-[110px_1fr_160px_160px_140px_100px] items-center gap-4 px-4 py-3 text-sm md:grid">
                <div className="flex items-center gap-2 text-text-muted">
                  <StatusDot status={a.status} />
                  <span className="text-xs capitalize">{a.status}</span>
                </div>
                <div className="truncate text-text">{a.strategyName}</div>
                <div className="font-mono text-xs text-text-muted tabnum">{a.amount ?? '—'}</div>
                <div className="font-mono text-xs text-text-muted tabnum">{a.price ? `$${a.price.toFixed(6)}` : '—'}</div>
                <a
                  href={`https://suprascan.io/tx/${a.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 font-mono text-xs text-text-muted hover:text-accent"
                >
                  {a.txHash}
                  <ExternalLink size={10} />
                </a>
                <div className="text-right text-xs text-text-faint">{relativeTime(a.timestamp)}</div>
              </div>

              <div className="px-4 py-3 md:hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusDot status={a.status} />
                    <span className="text-sm">{a.strategyName}</span>
                  </div>
                  <span className="text-2xs text-text-faint">{relativeTime(a.timestamp)}</span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-xs">
                  <span className="font-mono text-text-muted tabnum">
                    {a.amount ?? '—'} {a.price ? `@ $${a.price.toFixed(6)}` : ''}
                  </span>
                  <a
                    href={`https://suprascan.io/tx/${a.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 font-mono text-text-faint hover:text-accent"
                  >
                    {a.txHash}
                    <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}
