import { useState } from 'react'
import {
  Trophy,
  Zap,
  TrendingUp,
  Flame,
  Users,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  AlertCircle,
} from 'lucide-react'
import { Panel } from '../components/ui/Panel'
import { Button } from '../components/ui/Button'
import { useWallet } from '../context/WalletContext'
import { useLeaderboard, useUserRank } from '../hooks/useLeaderboard'
import { useReferral } from '../hooks/useReferral'
import { getApiUrl, type BoardType, type PeriodType } from '../lib/api'
import { cn, formatNumber, shortenAddress } from '../lib/utils'

const boards: {
  value: BoardType
  label: string
  icon: typeof Trophy
  format: (v: unknown) => string
}[] = [
  { value: 'points', label: 'Points', icon: Trophy, format: (v) => `${formatNumber(v, 0)} pts` },
  { value: 'volume', label: 'Volume', icon: TrendingUp, format: (v) => `$${formatNumber(v)}` },
  { value: 'executions', label: 'Executions', icon: Zap, format: (v) => formatNumber(v, 0) },
  { value: 'streak', label: 'Streak', icon: Flame, format: (v) => `${formatNumber(v, 0)}d` },
  { value: 'referrals', label: 'Referrals', icon: Users, format: (v) => formatNumber(v, 0) },
]

const periods: { value: PeriodType; label: string }[] = [
  { value: 'all', label: 'All time' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
]

function rankMedal(rank: number): string {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `#${rank}`
}

export function Leaderboard() {
  const { address } = useWallet()
  const [board, setBoard] = useState<BoardType>('points')
  const [period, setPeriod] = useState<PeriodType>('all')

  const { entries, loading, error, source, refresh } = useLeaderboard(board, period)
  const { rank: userRank } = useUserRank(address)
  const { data: referral, source: referralSource } = useReferral(address)

  const activeBoard = boards.find((b) => b.value === board) ?? boards[0]
  const showPeriodFilter = board === 'volume' || board === 'executions'

  const myRank =
    board === 'points' && userRank
      ? userRank.points
      : board === 'volume' && userRank
        ? userRank.volume
        : null

  const safeEntries = Array.isArray(entries) ? entries : []
  const iAmInList =
    !!address &&
    safeEntries.some((e) => e.address.toLowerCase() === address.toLowerCase())

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-medium tracking-tight">Leaderboard</h1>
            {source === 'mock' && (
              <span
                className="flex items-center gap-1 rounded border border-line bg-surface px-1.5 py-0.5 text-2xs text-text-muted"
                title="Backend not connected — showing demo data"
              >
                <Sparkles size={9} /> demo
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-text-muted">
            Top traders on Zentris. Points accrue toward future ZENTRIS allocation.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void refresh()}
          title="Refresh"
          aria-label="Refresh leaderboard"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        </Button>
      </div>

      {error && source === 'mock' && (
        <div className="flex items-start gap-2 rounded border border-line bg-surface px-3 py-2 text-xs">
          <AlertCircle size={12} className="mt-0.5 shrink-0 text-text-muted" />
          <div className="min-w-0">
            <p className="text-text-muted">{error}. Showing demo data.</p>
            <p className="mt-0.5 font-mono text-2xs text-text-faint">API: {getApiUrl()}</p>
          </div>
        </div>
      )}

      <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
        <div className="flex min-w-max items-center gap-1 border-b border-line">
          {boards.map((b) => {
            const Icon = b.icon
            const isActive = board === b.value
            return (
              <button
                key={b.value}
                onClick={() => setBoard(b.value)}
                className={cn(
                  'relative flex items-center gap-1.5 px-3 py-2 text-xs transition-colors',
                  isActive ? 'text-text' : 'text-text-muted hover:text-text',
                )}
              >
                <Icon size={12} />
                {b.label}
                {isActive && <span className="absolute inset-x-2 -bottom-px h-px bg-accent" />}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {showPeriodFilter ? (
          <div className="flex items-center gap-1">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={cn(
                  'rounded border px-2.5 py-1 text-2xs transition-colors',
                  period === p.value
                    ? 'border-line-strong bg-raised text-text'
                    : 'border-transparent text-text-muted hover:text-text',
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        ) : (
          <div />
        )}

        {address && myRank !== null && myRank > 0 && (
          <div className="flex items-center gap-2 rounded border border-line bg-surface px-3 py-1.5 text-xs">
            <Trophy size={12} className="text-accent" />
            <span className="text-text-muted">Your rank</span>
            <span className="font-mono font-medium tabnum">#{myRank}</span>
          </div>
        )}
      </div>

      {address && referral && (
        <ReferralCard
          link={referral.link}
          totalReferrals={referral.totalReferrals}
          isMock={referralSource === 'mock'}
        />
      )}

      <Panel className="overflow-hidden p-0">
        <div className="hidden grid-cols-[60px_1fr_140px] gap-4 border-b border-line px-4 py-2 text-2xs uppercase tracking-wider text-text-faint md:grid">
          <div>Rank</div>
          <div>Trader</div>
          <div className="text-right">{activeBoard.label}</div>
        </div>

        {loading ? (
          <div className="px-4 py-16 text-center text-xs text-text-faint">
            Loading leaderboard…
          </div>
        ) : safeEntries.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <p className="text-sm text-text-muted">No entries yet.</p>
            <p className="mt-1 text-xs text-text-faint">
              Create a strategy to earn your first points.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {safeEntries.map((entry) => {
              const isMe =
                !!address && entry.address.toLowerCase() === address.toLowerCase()
              return (
                <li
                  key={`${entry.address}-${entry.rank}`}
                  className={cn(
                    'grid grid-cols-[40px_1fr_auto] items-center gap-3 px-4 py-3 md:grid-cols-[60px_1fr_140px] md:gap-4',
                    isMe && 'bg-accent/5',
                  )}
                >
                  <div
                    className={cn(
                      'font-mono text-sm tabnum',
                      entry.rank <= 3 ? 'text-accent' : 'text-text-muted',
                    )}
                  >
                    {rankMedal(entry.rank)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-mono text-sm">
                        {entry.displayName ?? shortenAddress(entry.address)}
                      </span>
                      {isMe && (
                        <span className="rounded bg-accent/15 px-1.5 py-0.5 text-2xs text-accent">
                          you
                        </span>
                      )}
                    </div>
                    {board !== 'streak' &&
                      entry.currentStreak !== undefined &&
                      entry.currentStreak > 0 && (
                        <div className="mt-0.5 flex items-center gap-1 text-2xs text-text-faint">
                          <Flame size={9} /> {entry.currentStreak}d streak
                        </div>
                      )}
                  </div>

                  <div className="text-right font-mono text-sm tabnum">
                    {activeBoard.format(entry.value)}
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {!loading &&
          !error &&
          safeEntries.length > 0 &&
          address &&
          !iAmInList &&
          myRank !== null &&
          myRank > safeEntries.length && (
            <div className="border-t border-line bg-bg px-4 py-3 text-center text-xs text-text-muted">
              You're ranked <span className="font-mono text-text">#{myRank}</span>. Keep trading to climb the board.
            </div>
          )}
      </Panel>
    </div>
  )
}

function ReferralCard({
  link,
  totalReferrals,
  isMock,
}: {
  link: string
  totalReferrals: number
  isMock: boolean
}) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    void navigator.clipboard.writeText(link)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div className="flex flex-col gap-2 rounded border border-line bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">Your referral link</span>
          {isMock && <span className="text-2xs text-text-faint">(demo)</span>}
        </div>
        <div className="mt-0.5 truncate font-mono text-sm text-text">{link}</div>
        <div className="mt-0.5 text-2xs text-text-faint">
          {totalReferrals > 0
            ? `${totalReferrals} active user${totalReferrals === 1 ? '' : 's'} joined`
            : 'Earn +100 points per active user who joins with your link'}
        </div>
      </div>
      <button
        onClick={copy}
        className="flex h-8 shrink-0 items-center gap-1.5 rounded border border-line bg-raised px-2.5 text-xs text-text hover:bg-hover"
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}
