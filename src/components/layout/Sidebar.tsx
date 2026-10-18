import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Wallet, ListChecks, Sparkles, Activity, Settings as SettingsIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/vault', label: 'Vault', icon: Wallet },
  { to: '/strategies', label: 'Strategies', icon: ListChecks },
  { to: '/strategies/create', label: 'Create Strategy', icon: Sparkles },
  { to: '/activity', label: 'Activity', icon: Activity },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]

export function Sidebar() {
  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-border bg-bg-surface">
      <div className="flex items-center gap-2.5 border-b border-border px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-purple-700 text-sm font-bold">
          Z
        </div>
        <div>
          <div className="text-sm font-semibold">Zentris</div>
          <div className="text-[10px] uppercase tracking-wider text-gray-500">AutoFi on Supra</div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 p-3">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-accent/10 text-accent-soft' : 'text-gray-400 hover:bg-bg-elevated hover:text-white'
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <div className="rounded-lg bg-bg-elevated p-3">
          <div className="text-[10px] uppercase tracking-wider text-gray-500">Network</div>
          <div className="mt-1 flex items-center gap-1.5 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            Supra Testnet
          </div>
        </div>
      </div>
    </aside>
  )
}
