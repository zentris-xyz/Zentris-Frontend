import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(n: unknown, decimals = 2): string {
  const num = typeof n === 'number' ? n : Number(n)
  if (!Number.isFinite(num)) return '0'
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function shortenAddress(addr: unknown, chars = 4): string {
  const s = typeof addr === 'string' ? addr : ''
  if (s.length <= chars * 2 + 2) return s || '—'
  return `${s.slice(0, chars + 2)}…${s.slice(-chars)}`
}

export function relativeTime(input: Date | string | number): string {
  const date =
    input instanceof Date
      ? input
      : typeof input === 'number'
        ? new Date(input)
        : new Date(input)
  const t = date.getTime()
  if (!Number.isFinite(t)) return '—'

  const diff = Date.now() - t
  if (diff < 0) return 'just now'
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function formatTokenAmount(
  raw: bigint | string | number,
  decimals: number,
  maxFraction = 4,
): string {
  let v: bigint
  try {
    v = typeof raw === 'bigint' ? raw : BigInt(raw as string | number)
  } catch {
    return '0'
  }
  if (v === 0n) return '0'

  const s = v.toString().padStart(decimals + 1, '0')
  const int = s.slice(0, -decimals)
  const frac = s.slice(-decimals).slice(0, maxFraction).replace(/0+$/, '')
  return frac ? `${int}.${frac}` : int
}

export function toRawAmount(amount: number, decimals: number): bigint {
  if (!Number.isFinite(amount) || amount < 0) return 0n
  return BigInt(Math.floor(amount * 10 ** decimals))
}
