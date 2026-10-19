import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(n: number, decimals = 2): string {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function shortenAddress(addr: string, chars = 4): string {
  return `${addr.slice(0, chars + 2)}...${addr.slice(-chars)}`
}

export function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function formatTokenAmount(raw: bigint, decimals: number, maxFraction = 4): string {
  if (raw === 0n) return '0'
  const s = raw.toString().padStart(decimals + 1, '0')
  const int = s.slice(0, -decimals)
  const frac = s.slice(-decimals).slice(0, maxFraction).replace(/0+$/, '')
  return frac ? `${int}.${frac}` : int
}

export function toRawAmount(amount: number, decimals: number): bigint {
  return BigInt(Math.floor(amount * 10 ** decimals))
}
