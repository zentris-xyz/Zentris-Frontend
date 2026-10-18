import { NavLink, Link } from 'react-router-dom'
import { Settings as SettingsIcon, Wallet } from 'lucide-react'
import { cn, shortenAddress } from '../../lib/utils'

const links = [
  { to: '/', label: 'Overview', end: true },
  { to: '/vault', label: 'Vault' },
  { to: '/strategies', label: 'Strategies' },
  { to: '/activity', label: 'Activity' },
]

// Temporary — replace with useSupraWallet() when wallet SDK is integrated.
const CONNECTED_ADDRESS = '0x8a3f5b2c9d1e4f7a6b8c9d0e1f2a3b4c5d6e7f8a'

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-accent text-[10px] font-bold text-black">Z</div>
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
          <div className="hidden items-center gap-1.5 rounded border border-line bg-surface px-2 py-1 text-xs md:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            <span className="text-text-muted">Testnet</span>
          </div>

          <button className="flex h-8 items-center gap-1.5 rounded border border-line bg-surface px-2.5 text-xs text-text hover:bg-raised">
            <Wallet size={13} className="text-text-muted" />
            <span className="font-mono">{shortenAddress(CONNECTED_ADDRESS)}</span>
          </button>

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
