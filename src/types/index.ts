export type StrategyStatus = 'active' | 'paused' | 'executed' | 'cancelled'

export interface Strategy {
  id: string
  name: string
  intent: string
  action: 'BUY' | 'SELL'
  baseAsset: string
  quoteAsset: string
  quantity: number
  triggerPrice: number
  currentPrice: number
  status: StrategyStatus
  createdAt: Date
  lastExecuted?: Date
}

export type ActivityStatus = 'executed' | 'cancelled' | 'failed' | 'registered'

export interface Activity {
  id: string
  strategyName: string
  status: ActivityStatus
  amount?: string
  price?: number
  txHash: string
  timestamp: Date
}

export interface Asset {
  symbol: string
  name: string
  balance: number
  valueUsd: number
  decimals: number
  price: number
}
