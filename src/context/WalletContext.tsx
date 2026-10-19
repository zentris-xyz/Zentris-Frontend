import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getStarKeyProvider, SUPRA_CHAIN_ID } from '../lib/starkey'

interface WalletContextValue {
  address: string | null
  accounts: string[]
  chainId: number | null
  isConnected: boolean
  isInstalled: boolean
  isConnecting: boolean
  error: string | null
  connect: () => Promise<void>
  disconnect: () => Promise<void>
}

const WalletContext = createContext<WalletContextValue | null>(null)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [accounts, setAccounts] = useState<string[]>([])
  const [chainId, setChainId] = useState<number | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const syncFromProvider = useCallback(async () => {
    const provider = getStarKeyProvider()
    if (!provider) {
      setIsInstalled(false)
      return
    }
    setIsInstalled(true)

    try {
      const nextAccounts = await provider.account()
      setAccounts(nextAccounts)
      setAddress(nextAccounts[0] ?? null)

      const current = await provider.getChainId()
      setChainId(current ? Number(current.chainId) : null)
    } catch {
      // Wallet exists but is locked or unavailable — leave state empty.
    }
  }, [])

  useEffect(() => {
    void syncFromProvider()
  }, [syncFromProvider])

  useEffect(() => {
    const provider = getStarKeyProvider()
    if (!provider) return

    const handleAccountChanged = (next: string[]) => {
      setAccounts(next)
      setAddress(next[0] ?? null)
    }
    const handleNetworkChanged = (data: { chainId: number }) => {
      setChainId(data.chainId)
    }
    const handleDisconnect = () => {
      setAccounts([])
      setAddress(null)
      setChainId(null)
    }

    provider.on('accountChanged', handleAccountChanged)
    provider.on('networkChanged', handleNetworkChanged)
    provider.on('disconnect', handleDisconnect)

    return () => {
      provider.removeListener?.(
        'accountChanged',
        handleAccountChanged as (...args: unknown[]) => void
      )
      provider.removeListener?.(
        'networkChanged',
        handleNetworkChanged as (...args: unknown[]) => void
      )
      provider.removeListener?.(
        'disconnect',
        handleDisconnect as (...args: unknown[]) => void
      )
    }
  }, [])

  const connect = useCallback(async () => {
    setError(null)

    const provider = getStarKeyProvider()
    if (!provider) {
      setIsInstalled(false)
      setError('StarKey is not installed.')
      return
    }

    setIsConnecting(true)
    try {
      const next = await provider.connect({
        chainId: SUPRA_CHAIN_ID,
        multiple: false,
      })

      if (next.length === 0) {
        setError('Connection was rejected.')
        return
      }

      setAccounts(next)
      setAddress(next[0])

      const current = await provider.getChainId()
      setChainId(current ? Number(current.chainId) : SUPRA_CHAIN_ID)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to connect StarKey.')
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const disconnect = useCallback(async () => {
    const provider = getStarKeyProvider()
    if (!provider) return

    try {
      await provider.disconnect()
    } catch {
      // Ignore — clear local state anyway.
    }

    setAccounts([])
    setAddress(null)
    setChainId(null)
    setError(null)
  }, [])

  const value = useMemo<WalletContextValue>(
    () => ({
      address,
      accounts,
      chainId,
      isConnected: !!address,
      isInstalled,
      isConnecting,
      error,
      connect,
      disconnect,
    }),
    [address, accounts, chainId, isInstalled, isConnecting, error, connect, disconnect]
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used within WalletProvider')
  return ctx
}
