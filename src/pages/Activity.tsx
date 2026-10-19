import { ExternalLink } from 'lucide-react'
import { Panel } from '../components/ui/Panel'
import { StatusDot } from '../components/ui/StatusDot'
import { useActivity } from '../hooks/useSupra'
import { relativeTime } from '../lib/utils'

export function Activity() {
  const { data: activity, loading } = useActivity()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Activity</h1>
        <p className="mt-1 text-sm text-text-muted">Verifiable on-chain</p>
      </div>

      <Panel className="overflow-hidden p-0">
        <div className="hidden grid-cols-[110px_1fr_240px_160px_100px] gap-4 border-b border-line px-4 py-2 text-2xs uppercase tracking-wider text-text-faint md:grid">
          <div>Status</div>
          <div>Transaction</div>
          <div>Hash</div>
          <div>Block</div>
          <div className="text-right">Time</div>
        </div>

        {loading ? (
          <div className="px-4 py-10 text-center text-xs text-text-faint">Loading on-chain activity…</div>
        ) : (
          <ul className="divide-y divide-line">
            {(activity ?? []).map((a) => (
              <li key={a.id}>
                <div className="hidden grid-cols-[110px_1fr_240px_160px_100px] items-center gap-4 px-4 py-3 text-sm md:grid">
                  <div className="flex items-center gap-2 text-text-muted">
                    <StatusDot status={a.status} />
                    <span className="text-xs capitalize">{a.status}</span>
                  </div>
                  <div className="truncate text-text">{a.strategyName}</div>
                  <a href={`https://suprascan.io/tx/${a.txHash}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 truncate font-mono text-xs text-text-muted hover:text-accent">
                    {a.txHash.slice(0, 18)}… <ExternalLink size={10} />
                  </a>
                  <div className="font-mono text-xs text-text-muted tabnum">—</div>
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
                  <a href={`https://suprascan.io/tx/${a.txHash}`} target="_blank" rel="noopener noreferrer"
                    className="mt-1.5 flex items-center gap-1 font-mono text-2xs text-text-faint hover:text-accent">
                    {a.txHash.slice(0, 24)}… <ExternalLink size={10} />
                  </a>
                </div>
              </li>
            ))}
            {(activity ?? []).length === 0 && (
              <li className="px-4 py-16 text-center text-sm text-text-muted">
                No transactions found for this wallet.
              </li>
            )}
          </ul>
        )}
      </Panel>
    </div>
  )
}
