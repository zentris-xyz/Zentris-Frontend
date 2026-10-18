import { NavLink } from 'react-router-dom'
import { LayoutGrid, Wallet, ListChecks, Activity, Settings as SettingsIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

const items = [
  { to: '/', label: 'Home', icon: LayoutGrid, end: true },
  { to: '/vault', label: 'Vault', icon: Wallet },
  { to: '/strategies', label: 'Strategies', icon: ListChecks },
  { to: '/activity', label: 'Activity', icon: Activity },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 backdrop-blur md:hidden">
      <div className="grid grid-cols-5 pb-[env(safe-area-inset-bottom)]">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 py-2.5 text-[10px] transition-colors',
                isActive ? 'text-accent' : 'text-text-faint'
              )
            }
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
