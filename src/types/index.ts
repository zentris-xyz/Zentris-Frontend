export type StrategyStatus = 'active' | 'paused' | 'executed' | 'cancelled'
export type ActivityStatus = 'executed' | 'cancelled' | 'failed' | 'registered'

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

export interface Activity {
  id: string
  strategyName: string
  status: ActivityStatus
  amount?: string
  price?: number
  txHash: string
  timestamp: Date
}

export interface AssetBalance {
  symbol: string
  name: string
  coinType: string
  decimals: number
  priceUsd: number
  walletBalance: bigint
  vaultBalance: bigint
  valueUsd: number
}

export interface ParsedIntent {
  action: 'BUY' | 'SELL'
  baseAsset: string
  quoteAsset: string
  quantity: number
  triggerPrice: number
  referencePrice: number
  persistence: string
  confidence: number
}
