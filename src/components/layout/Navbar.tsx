import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Check, Copy, LogOut, Settings as SettingsIcon } from 'lucide-react'
import { cn, shortenAddress } from '../../lib/utils'
import { useWallet } from '../../context/WalletContext'
import { ConnectButton } from '../wallet/ConnectButton'

const links = [
  { to: '/', label: 'Overview', end: true },
  { to: '/vault', label: 'Vault' },
  { to: '/strategies', label: 'Strategies' },
  { to: '/activity', label: 'Activity' },
]

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-accent text-[10px] font-bold text-black">
              Z
            </div>
            <span className="text-sm font-semibold tracking-[0.18em]">ZENTRIS</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  cn(
                    'rounded px-2.5 py-1.5 text-sm transition-colors',
                    isActive ? 'text-text' : 'text-text-muted hover:text-text'
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <NetworkBadge />
          <WalletMenu />

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                'flex h-8 w-8 items-center justify-center rounded border border-line bg-surface hover:bg-raised',
                isActive ? 'text-text' : 'text-text-muted'
              )
            }
          >
            <SettingsIcon size={14} />
          </NavLink>
        </div>
      </div>
    </header>
  )
}

function NetworkBadge() {
  const { chainId } = useWallet()
  const label = chainId === 8 ? 'Mainnet' : chainId === 6 ? 'Testnet' : 'Supra'

  return (
    <div className="hidden items-center gap-1.5 rounded border border-line bg-surface px-2 py-1 text-xs md:flex">
      <span className="h-1.5 w-1.5 rounded-full bg-success" />
      <span className="text-text-muted">{label}</span>
    </div>
  )
}

function WalletMenu() {
  const { address, disconnect } = useWallet()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!address) return <ConnectButton size="sm" />

  const handleCopy = () => {
    void navigator.clipboard.writeText(address)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 items-center gap-1.5 rounded border border-line bg-surface px-2.5 text-xs text-text hover:bg-raised"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
        <span className="font-mono">{shortenAddress(address)}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-10 mt-1 w-44 rounded border border-line bg-surface py-1 shadow-lg shadow-black/40">
          <button
            onClick={handleCopy}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-text-muted hover:bg-raised hover:text-text"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy address'}
          </button>

          <button
            onClick={() => {
              void disconnect()
              setOpen(false)
            }}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-danger hover:bg-danger/10"
          >
            <LogOut size={12} />
            Disconnect
          </button>
        </div>
      )}
    </div>
  )
}
