import { cn } from '../../lib/utils'

type Status = 'active' | 'paused' | 'executed' | 'cancelled' | 'failed' | 'registered'

const color: Record<Status, string> = {
  active: 'bg-success',
  paused: 'bg-text-faint',
  executed: 'bg-accent',
  cancelled: 'bg-text-faint',
  failed: 'bg-danger',
  registered: 'bg-accent/60',
}

export function StatusDot({ status }: { status: Status }) {
  return <span className={cn('inline-block h-1.5 w-1.5 rounded-full', color[status])} />
}
