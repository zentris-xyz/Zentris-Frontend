import { useEffect, useState } from 'react'
import { checkApiHealth, fetchReferral, type ReferralInfo } from '../lib/api'
import { mockReferral } from '../lib/mock'
import type { DataSource } from './useLeaderboard'

export function useReferral(address: string | null) {
  const [data, setData] = useState<ReferralInfo | null>(null)
  const [source, setSource] = useState<DataSource>('loading')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!address) {
      setData(null)
      setLoading(false)
      return
    }

    let alive = true

    async function load(addr: string) {  // ← eksplisit
      setLoading(true)
      const healthy = await checkApiHealth()
      if (!alive) return

      if (healthy) {
        const r = await fetchReferral(addr)  // ✅
        if (!alive) return
        if (r) {
          setData(r)
          setSource('api')
          setLoading(false)
          return
        }
      }

      setData(mockReferral(addr))  // ✅
      setSource('mock')
      setLoading(false)
    }

    void load(address)

    return () => {
      alive = false
    }
  }, [address])

  return { data, source, loading }
}
