import { Loader2, Wallet } from 'lucide-react'
import { useWallet } from '../../context/WalletContext'
import { Button } from '../ui/Button'

interface Props {
  size?: 'sm' | 'md'
  className?: string
}

export function ConnectButton({ size = 'md', className }: Props) {
  const { connect, isConnecting, isInstalled, error } = useWallet()

  if (!isInstalled) {
    return (
      <a href="https://starkey.app" target="_blank" rel="noreferrer">
        <Button variant="secondary" size={size} className={className}>
          Install StarKey
        </Button>
      </a>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        size={size}
        className={className}
        onClick={() => void connect()}
        disabled={isConnecting}
      >
        {isConnecting ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Wallet size={14} />
        )}
        {isConnecting ? 'Connecting…' : 'Connect StarKey'}
      </Button>

      {error && <span className="text-2xs text-danger">{error}</span>}
    </div>
  )
}
