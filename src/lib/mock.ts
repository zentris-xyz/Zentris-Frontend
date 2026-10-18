import type { Strategy, Activity, Asset } from '../types'

const now = Date.now()
const hoursAgo = (h: number) => new Date(now - h * 3600_000)
const daysAgo = (d: number) => new Date(now - d * 86400_000)

export const mockAssets: Asset[] = [
  { symbol: 'SUPRA', name: 'Supra', balance: 12500, valueUsd: 12.5, decimals: 8, price: 0.001 },
  { symbol: 'USDC', name: 'USD Coin', balance: 245.5, valueUsd: 245.5, decimals: 6, price: 1 },
]

export const mockStrategies: Strategy[] = [
  {
    id: 's1',
    name: 'Buy SUPRA on dip',
    intent: 'Buy 1,000 SUPRA if price drops 5% from 0.001. If price rises above target, do not buy — wait until it truly drops.',
    action: 'BUY', baseAsset: 'SUPRA', quoteAsset: 'USDC',
    quantity: 1000, triggerPrice: 0.00095, currentPrice: 0.00102,
    status: 'active', createdAt: daysAgo(3), lastExecuted: hoursAgo(18),
  },
  {
    id: 's2',
    name: 'Weekly DCA',
    intent: 'Buy 500 SUPRA every Monday at 08:00 UTC.',
    action: 'BUY', baseAsset: 'SUPRA', quoteAsset: 'USDC',
    quantity: 500, triggerPrice: 0.001, currentPrice: 0.00102,
    status: 'active', createdAt: daysAgo(14), lastExecuted: hoursAgo(4),
  },
  {
    id: 's3',
    name: 'Take profit',
    intent: 'Sell 2,000 SUPRA when price reaches 0.0015.',
    action: 'SELL', baseAsset: 'SUPRA', quoteAsset: 'USDC',
    quantity: 2000, triggerPrice: 0.0015, currentPrice: 0.00102,
    status: 'active', createdAt: daysAgo(7),
  },
  {
    id: 's4',
    name: 'Deep dip buy',
    intent: 'Buy 5,000 SUPRA if price drops 20% from 0.001.',
    action: 'BUY', baseAsset: 'SUPRA', quoteAsset: 'USDC',
    quantity: 5000, triggerPrice: 0.0008, currentPrice: 0.00102,
    status: 'executed', createdAt: daysAgo(30), lastExecuted: daysAgo(12),
  },
]

export const mockActivity: Activity[] = [
  { id: 'a1', strategyName: 'Weekly DCA', status: 'executed', amount: '500 SUPRA', price: 0.00098, txHash: '0x8a3f...9c2e', timestamp: hoursAgo(4) },
  { id: 'a2', strategyName: 'Buy SUPRA on dip', status: 'executed', amount: '1,000 SUPRA', price: 0.00094, txHash: '0x4b7d...1a8f', timestamp: hoursAgo(18) },
  { id: 'a3', strategyName: 'Weekly DCA', status: 'executed', amount: '500 SUPRA', price: 0.00101, txHash: '0x2c9e...7f3b', timestamp: daysAgo(7) },
  { id: 'a4', strategyName: 'Deep dip buy', status: 'executed', amount: '5,000 SUPRA', price: 0.00079, txHash: '0x9d1a...3c5e', timestamp: daysAgo(12) },
  { id: 'a5', strategyName: 'Buy SUPRA on dip', status: 'registered', txHash: '0x6e8f...2d4a', timestamp: daysAgo(3) },
]

export const portfolioStats = {
  totalValue: 257.5,
  change24h: 2.4,
  activeStrategies: 3,
  totalExecutions: 12,
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

export async function parseIntent(text: string): Promise<ParsedIntent> {
  await new Promise((r) => setTimeout(r, 1400))

  const lower = text.toLowerCase()
  const quantityMatch = text.match(/(\d[\d,]*)\s*supra/i)
  const quantity = quantityMatch ? parseInt(quantityMatch[1].replace(/,/g, '')) : 1000

  const priceMatches = text.match(/0\.\d+/g)
  let triggerPrice = 0.00095
  if (priceMatches && priceMatches.length > 0) {
    const ref = parseFloat(priceMatches[0])
    if (lower.includes('5%')) triggerPrice = ref * 0.95
    else if (lower.includes('20%')) triggerPrice = ref * 0.8
    else if (priceMatches.length > 1) triggerPrice = parseFloat(priceMatches[1])
    else triggerPrice = ref
  }

  return {
    action: lower.includes('sell') ? 'SELL' : 'BUY',
    baseAsset: 'SUPRA',
    quoteAsset: 'USDC',
    quantity,
    triggerPrice,
    referencePrice: 0.001,
    persistence: 'Continue waiting until trigger is met',
    confidence: 0.92,
  }
}
