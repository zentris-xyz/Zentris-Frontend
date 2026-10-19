const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

export function getApiUrl(): string {
  return API_URL
}

/* ------------------------------------------------------------------ */
/*  Health check with cache                                           */
/* ------------------------------------------------------------------ */

let apiAvailable: boolean | null = null
let apiCheckInFlight: Promise<boolean> | null = null
let lastCheckAt = 0
const HEALTH_CACHE_MS = 15_000
const HEALTH_TIMEOUT_MS = 1500

export async function checkApiHealth(force = false): Promise<boolean> {
  const now = Date.now()

  if (!force && apiAvailable !== null && now - lastCheckAt < HEALTH_CACHE_MS) {
    return apiAvailable
  }

  if (apiCheckInFlight && !force) {
    return apiCheckInFlight
  }

  apiCheckInFlight = (async () => {
    try {
      const res = await fetch(`${API_URL}/health`, {
        signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS),
      })
      apiAvailable = res.ok
    } catch {
      apiAvailable = false
    } finally {
      lastCheckAt = Date.now()
      apiCheckInFlight = null
    }
    return apiAvailable ?? false
  })()

  return apiCheckInFlight
}

export function isApiAvailable(): boolean {
  return apiAvailable === true
}

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export type BoardType = 'points' | 'volume' | 'executions' | 'streak' | 'referrals'
export type PeriodType = 'all' | '7d' | '30d'

export interface LeaderboardEntry {
  rank: number
  address: string
  displayName?: string | null
  value: number
  currentStreak?: number
}

export interface UserRank {
  points: number
  volume: number
}

export interface ReferralInfo {
  code: string
  link: string
  totalReferrals: number
  totalPointsEarned: number
}

export interface UserProfile {
  address: string
  displayName: string | null
  referralCode: string
  points: number
  totalVolumeUsdc: number
  totalExecutions: number
  totalStrategies: number
  currentStreak: number
  longestStreak: number
}

export interface StatsResponse {
  users: number
  strategies: number
  executions: number
  estimatedVolumeUsdc: number
}

export interface RegisterStrategyInput {
  owner: string
  baseAsset: string
  quoteAsset: string
  baseCoinType: string
  quoteCoinType: string
  quantityRaw: string
  triggerPriceRaw: string
  intent?: string
  txHash?: string
  referredBy?: string
}

/* ------------------------------------------------------------------ */
/*  Leaderboard                                                       */
/* ------------------------------------------------------------------ */

export async function fetchLeaderboard(
  board: BoardType,
  period: PeriodType = 'all',
  limit = 50,
): Promise<LeaderboardEntry[]> {
  const params = new URLSearchParams({
    board,
    period,
    limit: String(limit),
  })
  const res = await fetch(`${API_URL}/api/leaderboard?${params}`, {
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`Backend ${res.status}`)

  const data = (await res.json()) as { entries?: unknown }
  if (!data || typeof data !== 'object' || !Array.isArray(data.entries)) {
    throw new Error('Invalid response from backend')
  }

  return (data.entries as Array<Record<string, unknown>>).map((e, i) => ({
    rank: typeof e.rank === 'number' ? e.rank : i + 1,
    address: String(e.address ?? ''),
    displayName: (e.displayName as string | null | undefined) ?? null,
    value: Number(e.value ?? 0),
    currentStreak:
      typeof e.currentStreak === 'number' ? e.currentStreak : undefined,
  }))
}

export async function fetchUserRank(address: string): Promise<UserRank | null> {
  try {
    const res = await fetch(`${API_URL}/api/leaderboard/rank/${address}`, {
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    const data = (await res.json()) as Partial<UserRank>
    return {
      points: Number(data.points ?? 0),
      volume: Number(data.volume ?? 0),
    }
  } catch {
    return null
  }
}

/* ------------------------------------------------------------------ */
/*  Referral                                                          */
/* ------------------------------------------------------------------ */

export async function fetchReferral(address: string): Promise<ReferralInfo | null> {
  try {
    const res = await fetch(`${API_URL}/api/referral/${address}`, {
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    const data = (await res.json()) as Partial<ReferralInfo>
    if (!data.code) return null
    return {
      code: data.code,
      link: data.link ?? `${window.location.origin}?ref=${data.code}`,
      totalReferrals: Number(data.totalReferrals ?? 0),
      totalPointsEarned: Number(data.totalPointsEarned ?? 0),
    }
  } catch {
    return null
  }
}

/* ------------------------------------------------------------------ */
/*  User                                                              */
/* ------------------------------------------------------------------ */

export async function fetchUserProfile(
  address: string,
): Promise<UserProfile | null> {
  try {
    const res = await fetch(`${API_URL}/api/users/${address}`, {
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    return (await res.json()) as UserProfile
  } catch {
    return null
  }
}

/* ------------------------------------------------------------------ */
/*  Stats                                                             */
/* ------------------------------------------------------------------ */

export async function fetchStats(): Promise<StatsResponse | null> {
  try {
    const res = await fetch(`${API_URL}/api/stats`, {
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    return (await res.json()) as StatsResponse
  } catch {
    return null
  }
}

/* ------------------------------------------------------------------ */
/*  Intent parsing                                                    */
/* ------------------------------------------------------------------ */

export interface ApiParsedIntent {
  action: 'BUY' | 'SELL'
  base_asset: string
  quote_asset: string
  quantity: number
  trigger_price: number
  reference_price?: number
  persistence: string
  confidence: number
}

export async function fetchParseIntent(text: string): Promise<ApiParsedIntent | null> {
  try {
    const res = await fetch(`${API_URL}/api/parse-intent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return null
    return (await res.json()) as ApiParsedIntent
  } catch {
    return null
  }
}

/* ------------------------------------------------------------------ */
/*  Strategy registration                                             */
/* ------------------------------------------------------------------ */

export async function registerStrategyWithBackend(
  input: RegisterStrategyInput,
): Promise<{ id: string } | null> {
  try {
    const res = await fetch(`${API_URL}/api/strategies`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    return (await res.json()) as { id: string }
  } catch {
    return null
  }
}
