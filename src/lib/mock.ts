import type {
  BoardType,
  LeaderboardEntry,
  PeriodType,
  ReferralInfo,
  StatsResponse,
  UserProfile,
  UserRank,
} from './api'
import type { Activity, Asset, Strategy } from '../types'

/* ------------------------------------------------------------------ */
/*  Vault / Strategy / Activity mock (untuk dev tanpa wallet)         */
/* ------------------------------------------------------------------ */

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
    intent: 'Buy 1,000 SUPRA if price drops 5% from 0.001.',
    action: 'BUY',
    baseAsset: 'SUPRA',
    quoteAsset: 'USDC',
    quantity: 1000,
    triggerPrice: 0.00095,
    currentPrice: 0.00102,
    status: 'active',
    createdAt: daysAgo(3),
    lastExecuted: hoursAgo(18),
  },
  {
    id: 's2',
    name: 'Weekly DCA',
    intent: 'Buy 500 SUPRA every Monday at 08:00 UTC.',
    action: 'BUY',
    baseAsset: 'SUPRA',
    quoteAsset: 'USDC',
    quantity: 500,
    triggerPrice: 0.001,
    currentPrice: 0.00102,
    status: 'active',
    createdAt: daysAgo(14),
    lastExecuted: hoursAgo(4),
  },
  {
    id: 's3',
    name: 'Deep dip buy',
    intent: 'Buy 5,000 SUPRA if price drops 20% from 0.001.',
    action: 'BUY',
    baseAsset: 'SUPRA',
    quoteAsset: 'USDC',
    quantity: 5000,
    triggerPrice: 0.0008,
    currentPrice: 0.00102,
    status: 'executed',
    createdAt: daysAgo(30),
    lastExecuted: daysAgo(12),
  },
]

export const mockActivity: Activity[] = [
  {
    id: 'a1',
    strategyName: 'Weekly DCA',
    status: 'executed',
    amount: '500 SUPRA',
    price: 0.00098,
    txHash: '0x8a3f...9c2e',
    timestamp: hoursAgo(4),
  },
  {
    id: 'a2',
    strategyName: 'Buy SUPRA on dip',
    status: 'executed',
    amount: '1,000 SUPRA',
    price: 0.00094,
    txHash: '0x4b7d...1a8f',
    timestamp: hoursAgo(18),
  },
  {
    id: 'a3',
    strategyName: 'Weekly DCA',
    status: 'executed',
    amount: '500 SUPRA',
    price: 0.00101,
    txHash: '0x2c9e...7f3b',
    timestamp: daysAgo(7),
  },
  {
    id: 'a4',
    strategyName: 'Deep dip buy',
    status: 'executed',
    amount: '5,000 SUPRA',
    price: 0.00079,
    txHash: '0x9d1a...3c5e',
    timestamp: daysAgo(12),
  },
]

export const portfolioStats = {
  totalValue: 257.5,
  change24h: 2.4,
  activeStrategies: 3,
  totalExecutions: 12,
}

/* ------------------------------------------------------------------ */
/*  Leaderboard mock                                                  */
/* ------------------------------------------------------------------ */

interface MockLeader {
  address: string
  displayName: string | null
  points: number
  volume: number
  executions: number
  streak: number
  referrals: number
  currentStreak: number
}

const MOCK_LEADERS: MockLeader[] = [
  {
    address: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    displayName: 'whale.sui',
    points: 4250,
    volume: 12500,
    executions: 52,
    streak: 14,
    referrals: 8,
    currentStreak: 4,
  },
  {
    address: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
    displayName: 'supra_maxi',
    points: 3120,
    volume: 8900,
    executions: 38,
    streak: 9,
    referrals: 5,
    currentStreak: 2,
  },
  {
    address: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
    displayName: null,
    points: 2870,
    volume: 7400,
    executions: 31,
    streak: 12,
    referrals: 3,
    currentStreak: 0,
  },
  {
    address: '0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
    displayName: 'gm.sol',
    points: 1980,
    volume: 5600,
    executions: 24,
    streak: 6,
    referrals: 2,
    currentStreak: 1,
  },
  {
    address: '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f',
    displayName: null,
    points: 1540,
    volume: 4100,
    executions: 19,
    streak: 5,
    referrals: 4,
    currentStreak: 3,
  },
  {
    address: '0x6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a',
    displayName: 'early.bird',
    points: 1180,
    volume: 3200,
    executions: 15,
    streak: 4,
    referrals: 1,
    currentStreak: 2,
  },
  {
    address: '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
    displayName: null,
    points: 920,
    volume: 2100,
    executions: 12,
    streak: 3,
    referrals: 0,
    currentStreak: 1,
  },
  {
    address: '0x8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c',
    displayName: 'crypto_degen',
    points: 710,
    volume: 1800,
    executions: 9,
    streak: 2,
    referrals: 2,
    currentStreak: 0,
  },
  {
    address: '0x9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d',
    displayName: null,
    points: 540,
    volume: 1200,
    executions: 7,
    streak: 2,
    referrals: 1,
    currentStreak: 1,
  },
  {
    address: '0xa0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1',
    displayName: null,
    points: 380,
    volume: 800,
    executions: 5,
    streak: 1,
    referrals: 0,
    currentStreak: 0,
  },
]

function leaderValue(l: MockLeader, board: BoardType): number {
  switch (board) {
    case 'points': return l.points
    case 'volume': return l.volume
    case 'executions': return l.executions
    case 'streak': return l.streak
    case 'referrals': return l.referrals
  }
}

export function mockLeaderboard(
  board: BoardType,
  _period: PeriodType = 'all',
): LeaderboardEntry[] {
  const sorted = [...MOCK_LEADERS].sort((a, b) => leaderValue(b, board) - leaderValue(a, board))

  return sorted.map((l, i) => ({
    rank: i + 1,
    address: l.address,
    displayName: l.displayName,
    value: leaderValue(l, board),
    currentStreak: l.currentStreak,
  }))
}

export function mockUserRank(address: string): UserRank {
  const idx = MOCK_LEADERS.findIndex((l) => l.address.toLowerCase() === address.toLowerCase())
  return {
    points: idx >= 0 ? idx + 1 : 0,
    volume: idx >= 0 ? idx + 1 : 0,
  }
}

/* ------------------------------------------------------------------ */
/*  Referral & user mock                                              */
/* ------------------------------------------------------------------ */

function shortCode(address: string): string {
  const hex = address.replace(/^0x/i, '')
  return (hex.slice(0, 8) || 'DEMO0000').toUpperCase()
}

export function mockReferral(address: string): ReferralInfo {
  const code = shortCode(address)
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://zentris.xyz'
  return {
    code,
    link: `${origin}?ref=${code}`,
    totalReferrals: 0,
    totalPointsEarned: 0,
  }
}

export function mockUserProfile(address: string): UserProfile {
  return {
    address,
    displayName: null,
    referralCode: shortCode(address),
    points: 0,
    totalVolumeUsdc: 0,
    totalExecutions: 0,
    totalStrategies: 0,
    currentStreak: 0,
    longestStreak: 0,
  }
}

export function mockStats(): StatsResponse {
  return {
    users: MOCK_LEADERS.length,
    strategies: 42,
    executions: 195,
    estimatedVolumeUsdc: 48900,
  }
}
