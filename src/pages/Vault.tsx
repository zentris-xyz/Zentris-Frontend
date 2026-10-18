import { useState } from 'react'
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import { Panel } from '../components/ui/Panel'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { mockAssets } from '../lib/mock'
import { formatNumber } from '../lib/utils'
import type { Asset } from '../types'

export function Vault() {
  const [modal, setModal] = useState<{ type: 'deposit' | 'withdraw'; asset: Asset } | null>(null)
  const [amount, setAmount] = useState('')

  const total = mockAssets.reduce((s, a) => s + a.valueUsd, 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Vault</h1>
        <p className="mt-1 text-sm text-text-muted">Non-custodial. Withdraw anytime.</p>
      </div>

      <div className="grid grid-cols-2 divide-x divide-line border-y border-line md:grid-cols-4">
        <div className="px-4 py-3">
          <div className="text-2xs uppercase tracking-wider text-text-faint">Total value</div>
          <div className="mt-1 font-mono text-xl tabnum">${total.toFixed(2)}</div>
        </div>
        <div className="px-4 py-3">
          <div className="text-2xs uppercase tracking-wider text-text-faint">Vault TVL</div>
          <div className="mt-1 font-mono text-xl tabnum">$12,847.50</div>
        </div>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-text">Assets</h2>
        </div>

        <Panel className="overflow-hidden p-0">
          <div className="hidden grid-cols-[1fr_180px_180px_200px] gap-4 border-b border-line px-4 py-2 text-2xs uppercase tracking-wider text-text-faint md:grid">
            <div>Asset</div>
            <div className="text-right">Balance</div>
            <div className="text-right">Value</div>
            <div className="text-right">Actions</div>
          </div>

          <ul className="divide-y divide-line">
            {mockAssets.map((a) => (
              <li key={a.symbol}>
                {/* Desktop */}
                <div className="hidden grid-cols-[1fr_180px_180px_200px] items-center gap-4 px-4 py-3 md:grid">
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded border border-line bg-raised text-xs font-medium text-text">
                      {a.symbol[0]}
                    </div>
                    <div>
                      <div className="text-sm text-text">{a.symbol}</div>
                      <div className="text-xs text-text-faint">{a.name}</div>
                    </div>
                  </div>
                  <div className="text-right font-mono text-sm tabnum">
                    {formatNumber(a.balance, a.decimals > 4 ? 2 : 6)}
                  </div>
                  <div className="text-right font-mono text-sm text-text-muted tabnum">
                    ${formatNumber(a.valueUsd)}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setModal({ type: 'deposit', asset: a })}>
                      <ArrowDownToLine size={12} /> Deposit
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setModal({ type: 'withdraw', asset: a })}>
                      <ArrowUpFromLine size={12} /> Withdraw
                    </Button>
                  </div>
                </div>

                {/* Mobile */}
                <div className="px-4 py-3 md:hidden">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded border border-line bg-raised text-xs font-medium">
                        {a.symbol[0]}
                      </div>
                      <div>
                        <div className="text-sm">{a.symbol}</div>
                        <div className="text-xs text-text-faint">{a.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm tabnum">{formatNumber(a.balance, a.decimals > 4 ? 2 : 6)}</div>
                      <div className="text-xs text-text-faint tabnum">${formatNumber(a.valueUsd)}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button variant="secondary" size="sm" className="flex-1" onClick={() => setModal({ type: 'deposit', asset: a })}>
                      Deposit
                    </Button>
                    <Button variant="secondary" size="sm" className="flex-1" onClick={() => setModal({ type: 'withdraw', asset: a })}>
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
        onClose={() => setModal(null)}
        title={`${modal?.type === 'deposit' ? 'Deposit' : 'Withdraw'} ${modal?.asset.symbol ?? ''}`}
      >
        {modal && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs text-text-muted">Amount</label>
              <Input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <div className="mt-1.5 flex items-center justify-between text-2xs">
                <span className="text-text-faint">
                  Available: {formatNumber(modal.asset.balance, 2)} {modal.asset.symbol}
                </span>
                <button onClick={() => setAmount(String(modal.asset.balance))} className="text-accent hover:underline">
                  Max
                </button>
              </div>
            </div>
            <p className="rounded border border-line bg-bg p-2.5 text-xs text-text-muted">
              {modal.type === 'deposit'
                ? 'Funds move into the on-chain Zentris vault.'
                : 'Funds return to your wallet. Active strategies using these funds must be cancelled first.'}
            </p>
            <Button className="w-full" onClick={() => { setModal(null); setAmount('') }}>
              Confirm
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
