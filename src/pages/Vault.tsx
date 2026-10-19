import { useState } from 'react'
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import { Panel } from '../components/ui/Panel'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { ConnectButton } from '../components/wallet/ConnectButton'
import { useWallet } from '../context/WalletContext'
import { useAssetBalances } from '../hooks/useSupra'
import { depositToVault, withdrawFromVault } from '../lib/supra'
import { formatNumber, formatTokenAmount, toRawAmount } from '../lib/utils'
import type { AssetBalance } from '../types'

export function Vault() {
  const { address, isConnected } = useWallet()
  const { data: assets, loading, refresh } = useAssetBalances()

  const [modal, setModal] = useState<{ type: 'deposit' | 'withdraw'; asset: AssetBalance } | null>(null)
  const [amount, setAmount] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const total = (assets ?? []).reduce((sum, asset) => sum + asset.valueUsd, 0)

  const handleConfirm = async () => {
    if (!modal || !address) return
    setBusy(true)
    setError(null)
    try {
      const raw = toRawAmount(Number(amount), modal.asset.decimals)
      if (modal.type === 'deposit') {
        await depositToVault(address, modal.asset.coinType, raw)
      } else {
        await withdrawFromVault(address, modal.asset.coinType, raw)
      }
      setModal(null)
      setAmount('')
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Transaction failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Vault</h1>
        <p className="mt-1 text-sm text-text-muted">Non-custodial. Withdraw anytime.</p>
      </div>

      {!isConnected && (
        <div className="flex flex-col gap-3 rounded border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-text">Connect StarKey to use the vault</p>
            <p className="mt-0.5 text-xs text-text-muted">
              Deposits and withdrawals are signed by your wallet.
            </p>
          </div>
          <ConnectButton size="sm" />
        </div>
      )}

      <div className="grid grid-cols-2 divide-x divide-line border-y border-line md:grid-cols-4">
        <div className="px-4 py-3">
          <div className="text-2xs uppercase tracking-wider text-text-faint">Total value</div>
          <div className="mt-1 font-mono text-xl tabnum">${formatNumber(total)}</div>
        </div>
        <div className="px-4 py-3">
          <div className="text-2xs uppercase tracking-wider text-text-faint">Assets</div>
          <div className="mt-1 font-mono text-xl tabnum">{assets?.length ?? 0}</div>
        </div>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-text">Assets</h2>
          {loading && <span className="text-xs text-text-faint">Loading…</span>}
        </div>

        <Panel className="overflow-hidden p-0">
          <div className="hidden grid-cols-[1fr_180px_180px_200px] gap-4 border-b border-line px-4 py-2 text-2xs uppercase tracking-wider text-text-faint md:grid">
            <div>Asset</div>
            <div className="text-right">Wallet</div>
            <div className="text-right">In vault</div>
            <div className="text-right">Actions</div>
          </div>

          <ul className="divide-y divide-line">
            {(assets ?? []).map((asset) => (
              <li key={asset.symbol}>
                <div className="hidden grid-cols-[1fr_180px_180px_200px] items-center gap-4 px-4 py-3 md:grid">
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded border border-line bg-raised text-xs font-medium">
                      {asset.symbol[0]}
                    </div>
                    <div>
                      <div className="text-sm">{asset.symbol}</div>
                      <div className="text-xs text-text-faint">${formatNumber(asset.valueUsd)}</div>
                    </div>
                  </div>
                  <div className="text-right font-mono text-sm tabnum">
                    {formatTokenAmount(asset.walletBalance, asset.decimals)}
                  </div>
                  <div className="text-right font-mono text-sm text-text-muted tabnum">
                    {formatTokenAmount(asset.vaultBalance, asset.decimals)}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" size="sm" disabled={!isConnected}
                      onClick={() => setModal({ type: 'deposit', asset })}>
                      <ArrowDownToLine size={12} /> Deposit
                    </Button>
                    <Button variant="secondary" size="sm" disabled={!isConnected}
                      onClick={() => setModal({ type: 'withdraw', asset })}>
                      <ArrowUpFromLine size={12} /> Withdraw
                    </Button>
                  </div>
                </div>

                <div className="px-4 py-3 md:hidden">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm">{asset.symbol}</div>
                      <div className="text-xs text-text-faint">
                        Wallet {formatTokenAmount(asset.walletBalance, asset.decimals)}
                      </div>
                      <div className="text-xs text-text-faint">
                        Vault {formatTokenAmount(asset.vaultBalance, asset.decimals)}
                      </div>
                    </div>
                    <div className="text-right font-mono text-sm tabnum">
                      ${formatNumber(asset.valueUsd)}
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button variant="secondary" size="sm" className="flex-1" disabled={!isConnected}
                      onClick={() => setModal({ type: 'deposit', asset })}>
                      Deposit
                    </Button>
                    <Button variant="secondary" size="sm" className="flex-1" disabled={!isConnected}
                      onClick={() => setModal({ type: 'withdraw', asset })}>
                      Withdraw
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </section>

      <Modal
        open={!!modal}
        onClose={() => { if (!busy) { setModal(null); setError(null) } }}
        title={`${modal?.type === 'deposit' ? 'Deposit' : 'Withdraw'} ${modal?.asset.symbol ?? ''}`}
      >
        {modal && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs text-text-muted">Amount</label>
              <Input type="number" placeholder="0.00" value={amount}
                onChange={(e) => setAmount(e.target.value)} disabled={busy} />
              <div className="mt-1.5 flex items-center justify-between text-2xs">
                <span className="text-text-faint">
                  Available: {formatTokenAmount(
                    modal.type === 'deposit' ? modal.asset.walletBalance : modal.asset.vaultBalance,
                    modal.asset.decimals,
                  )} {modal.asset.symbol}
                </span>
                <button
                  onClick={() => setAmount(formatTokenAmount(
                    modal.type === 'deposit' ? modal.asset.walletBalance : modal.asset.vaultBalance,
                    modal.asset.decimals,
                  ))}
                  className="text-accent hover:underline"
                >
                  Max
                </button>
              </div>
            </div>

            {error && <p className="text-xs text-danger">{error}</p>}

            <Button className="w-full" onClick={() => void handleConfirm()} disabled={busy || !amount}>
              {busy ? 'Confirm in StarKey…' : 'Confirm'}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
