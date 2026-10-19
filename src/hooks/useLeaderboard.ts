import { useCallback, useEffect, useState } from 'react'
import {
  checkApiHealth,
  fetchLeaderboard,
  fetchUserRank,
  type BoardType,
  type LeaderboardEntry,
  type PeriodType,
  type UserRank,
} from '../lib/api'
import { mockLeaderboard, mockUserRank } from '../lib/mock'

export type DataSource = 'api' | 'mock' | 'loading'

export function useLeaderboard(board: BoardType, period: PeriodType) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<DataSource>('loading')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    const healthy = await checkApiHealth(true)

    if (!healthy) {
      setEntries(mockLeaderboard(board, period))
      setSource('mock')
      setError(null)
      setLoading(false)
      return
    }

    try {
      const result = await fetchLeaderboard(board, period)
      setEntries(result)
      setSource('api')
    } catch (e) {
      setEntries(mockLeaderboard(board, period))
      setSource('mock')
      setError(e instanceof Error ? e.message : 'Backend error, showing demo data')
    } finally {
      setLoading(false)
    }
  }, [board, period])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { entries, loading, error, source, refresh }
}

export function useUserRank(address: string | null) {
  const [rank, setRank] = useState<UserRank | null>(null)
  const [source, setSource] = useState<DataSource>('loading')

  useEffect(() => {
    if (!address) {
      setRank(null)
      setSource('loading')
      return
    }

    let alive = true

    async function load(addr: string) {  // ← eksplisit: string
      const healthy = await checkApiHealth()
      if (!alive) return

      if (healthy) {
        const r = await fetchUserRank(addr)  // ✅ addr is string
        if (!alive) return
        if (r) {
          setRank(r)
          setSource('api')
          return
        }
      }

      setRank(mockUserRank(addr))  // ✅
      setSource('mock')
    }

    void load(address)  // ← address sudah narrowed jadi string di sini

    return () => {
      alive = false
    }
  }, [address])

  return { rank, source }
}
