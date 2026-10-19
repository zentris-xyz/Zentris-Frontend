import type { StarKeyProvider } from '../types/starkey'

export const SUPRA_CHAIN_ID = Number(import.meta.env.VITE_SUPRA_CHAIN_ID ?? 6)

export function getStarKeyProvider(): StarKeyProvider | null {
  if (typeof window === 'undefined') return null
  return window.starkey?.supra ?? null
}

export function isStarKeyAvailable(): boolean {
  return getStarKeyProvider() !== null
}
