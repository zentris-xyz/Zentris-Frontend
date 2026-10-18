import { Wallet, Bell } from 'lucide-react'
import { Button } from '../ui/Button'
import { shortenAddress } from '../../lib/utils'

export function Topbar() {
  const connected = true
  const address = '0x8a3f5b2c9d1e4f7a6b8c9d0e1f2a3b4c5d6e7f8a'

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-bg-surface px-6">
      <h1 className="text-sm font-medium text-gray-400">Zentris App</h1>
      <div className="flex items-center gap-3">
        <button className="rounded-lg p-2 text-gray-400 hover:bg-bg-elevated hover:text-white">
          <Bell size={18} />
        </button>
        {connected ? (
          <Button variant="secondary" size="sm">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            <span className="font-mono text-xs">{shortenAddress(address)}</span>
          </Button>
        ) : (
          <Button size="sm">
            <Wallet size={14} /> Connect Wallet
          </Button>
        )}
      </div>
    </header>
  )
}
