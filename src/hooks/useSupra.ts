import { useCallback, useEffect, useState } from 'react'
import { useWallet } from '../context/WalletContext'
import {
  fetchSupraPrice,
  readActivity,
  readAssetBalances,
  readStrategies,
  readVaultTvl,
} from '../lib/supra'
import type { Activity, AssetBalance, Strategy } from '../types'

function useAsync<T>(loader: () => Promise<T>, deps: unknown[], enabled = true) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!enabled) {
      setData(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      setData(await loader())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, deps)

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { data, loading, error, refresh }
}

export function useSupraPrice() {
  return useAsync(() => fetchSupraPrice(), [])
}

export function useAssetBalances() {
  const { address } = useWallet()
  return useAsync<AssetBalance[]>(
    () => (address ? readAssetBalances(address) : Promise.resolve([])),
    [address],
    !!address,
  )
}

export function useStrategies() {
  const { address } = useWallet()
  return useAsync<Strategy[]>(
    async () => {
      if (!address) return []
      const price = await fetchSupraPrice()
      return readStrategies(address, price)
    },
    [address],
    !!address,
  )
}

export function useActivity() {
  const { address } = useWallet()
  return useAsync<Activity[]>(
    () => (address ? readActivity(address) : Promise.resolve([])),
    [address],
    !!address,
  )
}

export function useVaultTvl() {
  return useAsync(() => readVaultTvl(), [])
}
