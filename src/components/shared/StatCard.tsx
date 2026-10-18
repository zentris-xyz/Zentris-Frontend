import type { ReactNode } from 'react'
import { Card } from '../ui/Card'
import { cn } from '../../lib/utils'

interface StatCardProps {
  label: string
  value: string
  change?: string
  changePositive?: boolean
  icon?: ReactNode
}

export function StatCard({ label, value, change, changePositive, icon }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium text-gray-500">{label}</div>
          <div className="mt-1 text-2xl font-semibold">{value}</div>
          {change && (
            <div className={cn('mt-1 text-xs font-medium', changePositive ? 'text-green-400' : 'text-red-400')}>
              {change}
            </div>
          )}
        </div>
        {icon && <div className="rounded-lg bg-accent/10 p-2 text-accent-soft">{icon}</div>}
      </div>
    </Card>
  )
}
