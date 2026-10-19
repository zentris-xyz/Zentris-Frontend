import type { ParsedIntent } from '../types'

export function parseIntent(text: string): ParsedIntent {
  const lower = text.toLowerCase()

  const quantityMatch = text.match(/(\d[\d,]*)\s*supra/i)
  const quantity = quantityMatch
    ? Number(quantityMatch[1].replace(/,/g, ''))
    : 0

  const priceMatches = text.match(/0\.\d+/g) ?? []
  const referencePrice = priceMatches[0] ? Number(priceMatches[0]) : 0

  let triggerPrice = referencePrice
  if (lower.includes('5%') && referencePrice > 0) triggerPrice = referencePrice * 0.95
  else if (lower.includes('10%') && referencePrice > 0) triggerPrice = referencePrice * 0.9
  else if (lower.includes('20%') && referencePrice > 0) triggerPrice = referencePrice * 0.8
  else if (priceMatches[1]) triggerPrice = Number(priceMatches[1])

  return {
    action: lower.includes('sell') ? 'SELL' : 'BUY',
    baseAsset: 'SUPRA',
    quoteAsset: 'USDC',
    quantity,
    triggerPrice,
    referencePrice,
    persistence: 'Continue waiting until trigger is met',
    confidence: quantity > 0 && triggerPrice > 0 ? 1 : 0,
  }
}
