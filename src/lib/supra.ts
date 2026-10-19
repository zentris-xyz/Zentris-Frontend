// @ts-expect-error - supra-l1-sdk types are not published
import { BCS, HexString, SupraClient } from 'supra-l1-sdk'
import { getStarKeyProvider } from './starkey'
import type { Activity, AssetBalance, Strategy } from '../types'

export const RPC_URL = import.meta.env.VITE_SUPRA_RPC ?? 'https://rpc-testnet.supra.com'
export const CHAIN_ID = Number(import.meta.env.VITE_SUPRA_CHAIN_ID ?? 6)
export const MODULE_ADDRESS = import.meta.env.VITE_ZENTRIS_MODULE_ADDRESS ?? ''
export const USDC_COIN_TYPE = import.meta.env.VITE_USDC_COIN_TYPE ?? ''
export const PRICE_PAIR = import.meta.env.VITE_SUPRA_PRICE_PAIR ?? 'supra_usdt'
export const DEBUG = import.meta.env.VITE_DEBUG_SUPRA === 'true'

export const SUPRA_COIN_TYPE = '0x1::supra_coin::SupraCoin'

/* ---------------------------------------------------------------- */
/*  CoinGecko price with 60s cache                                  */
/* ---------------------------------------------------------------- */

const COINGECKO_PRICE_URL =
  'https://api.coingecko.com/api/v3/simple/price?ids=supra&vs_currencies=usd'

const PRICE_CACHE_TTL_MS = 60_000

let priceCache: { value: number; timestamp: number } | null = null
let priceInFlight: Promise<number> | null = null

function log(...args: unknown[]) {
  if (DEBUG) console.log('[supra]', ...args)
}

export async function fetchSupraPrice(): Promise<number> {
  const now = Date.now()

  if (priceCache && now - priceCache.timestamp < PRICE_CACHE_TTL_MS) {
    return priceCache.value
  }

  if (priceInFlight) {
    return priceInFlight
  }

  priceInFlight = (async () => {
    try {
      const res = await fetch(COINGECKO_PRICE_URL, {
        headers: { accept: 'application/json' },
      })

      if (res.ok) {
        const json = (await res.json()) as { supra?: { usd?: number } }
        const price = Number(json?.supra?.usd)

        if (Number.isFinite(price) && price > 0) {
          priceCache = { value: price, timestamp: Date.now() }
          log('coingecko price', price)
          return price
        }
      } else {
        log('coingecko non-ok', res.status)
      }
    } catch (e) {
      log('coingecko fetch failed', e)
    }

    const fallbackPairs = [PRICE_PAIR, 'supra_usdt', 'supra_usd']

    for (const pair of fallbackPairs) {
      try {
        const res = await fetch(
          `https://prod-kline-rest.supra.com/latest?trading_pair=${pair}`,
        )
        if (!res.ok) continue

        const json = (await res.json()) as {
          instruments?: Array<{ currentPrice?: number | string }>
        }
        const price = Number(json?.instruments?.[0]?.currentPrice)

        if (Number.isFinite(price) && price > 0) {
          priceCache = { value: price, timestamp: Date.now() }
          log('supra kline fallback price', pair, price)
          return price
        }
      } catch {
        // try next pair
      }
    }

    if (priceCache) {
      log('returning stale price', priceCache.value)
      return priceCache.value
    }

    return 0
  })()

  try {
    return await priceInFlight
  } finally {
    priceInFlight = null
  }
}

/* ---------------------------------------------------------------- */
/*  Supra client                                                    */
/* ---------------------------------------------------------------- */

type SupraClientType = Awaited<ReturnType<typeof SupraClient.init>>

let clientPromise: Promise<SupraClientType> | null = null

export function getSupraClient(): Promise<SupraClientType> {
  if (!clientPromise) {
    clientPromise = SupraClient.init(RPC_URL)
  }
  return clientPromise!   // ← tambah !
}

function assertModuleAddress() {
  if (!MODULE_ADDRESS) {
    throw new Error('VITE_ZENTRIS_MODULE_ADDRESS is not configured')
  }
}

function normalizeBigInt(value: unknown): bigint {
  if (typeof value === 'bigint') return value
  if (typeof value === 'number') return BigInt(Math.trunc(value))
  if (typeof value === 'string') {
    try {
      return BigInt(value)
    } catch {
      return 0n
    }
  }
  if (value && typeof value === 'object' && 'toString' in value) {
    try {
      return BigInt(value.toString())
    } catch {
      return 0n
    }
  }
  return 0n
}

/* ---------------------------------------------------------------- */
/*  Wallet balance readers                                          */
/* ---------------------------------------------------------------- */

async function getWalletSupraBalance(owner: string): Promise<bigint> {
  const client = await getSupraClient()
  const address = HexString.ensure(owner)

  try {
    const balance = await client.getAccountSupraCoinBalance(address)
    log('getAccountSupraCoinBalance', owner, balance)
    return normalizeBigInt(balance)
  } catch (e) {
    log('getAccountSupraCoinBalance failed, falling back to view', e)
  }

  try {
    const result = await client.invokeViewMethod(
      '0x1::coin::balance',
      [SUPRA_COIN_TYPE],
      [owner],
    )
    log('view 0x1::coin::balance', result)
    return normalizeBigInt(result?.[0])
  } catch (e) {
    log('view 0x1::coin::balance failed', e)
    return 0n
  }
}

async function getWalletCoinBalance(owner: string, coinType: string): Promise<bigint> {
  const client = await getSupraClient()
  const address = HexString.ensure(owner)

  try {
    const balance = await client.getAccountCoinBalance(address, coinType)
    log('getAccountCoinBalance', coinType, balance)
    return normalizeBigInt(balance)
  } catch (e) {
    log('getAccountCoinBalance failed, falling back to view', coinType, e)
  }

  try {
    const result = await client.invokeViewMethod(
      '0x1::coin::balance',
      [coinType],
      [owner],
    )
    log('view 0x1::coin::balance', coinType, result)
    return normalizeBigInt(result?.[0])
  } catch (e) {
    log('view 0x1::coin::balance failed', coinType, e)
    return 0n
  }
}

async function safeViewU64(
  functionName: string,
  typeArguments: string[],
  arguments_: string[],
): Promise<bigint> {
  try {
    const client = await getSupraClient()
    const result = await client.invokeViewMethod(functionName, typeArguments, arguments_)
    return normalizeBigInt(result?.[0])
  } catch {
    return 0n
  }
}

/* ---------------------------------------------------------------- */
/*  Public reads                                                    */
/* ---------------------------------------------------------------- */

export async function readAssetBalances(owner: string): Promise<AssetBalance[]> {
  const supraPrice = await fetchSupraPrice()

  const assets = [
    {
      symbol: 'SUPRA',
      name: 'Supra',
      coinType: SUPRA_COIN_TYPE,
      decimals: 8,
      priceUsd: supraPrice,
    },
    ...(USDC_COIN_TYPE
      ? [
          {
            symbol: 'USDC',
            name: 'USD Coin',
            coinType: USDC_COIN_TYPE,
            decimals: 6,
            priceUsd: 1,
          },
        ]
      : []),
  ]

  const result: AssetBalance[] = []

  for (const asset of assets) {
    const walletBalance =
      asset.symbol === 'SUPRA'
        ? await getWalletSupraBalance(owner)
        : await getWalletCoinBalance(owner, asset.coinType)

    let vaultBalance = 0n
    if (MODULE_ADDRESS) {
      vaultBalance = await safeViewU64(
        `${MODULE_ADDRESS}::vault::balance_of`,
        [asset.coinType],
        [owner],
      )
    }

    const totalRaw = walletBalance + vaultBalance
    const valueUsd = (Number(totalRaw) / 10 ** asset.decimals) * asset.priceUsd

    result.push({ ...asset, walletBalance, vaultBalance, valueUsd })
  }

  log('readAssetBalances', owner, result)
  return result
}

export async function readVaultTvl(): Promise<bigint> {
  if (!MODULE_ADDRESS) return 0n
  return safeViewU64(`${MODULE_ADDRESS}::vault::vault_balance`, [SUPRA_COIN_TYPE], [])
}

function symbolFromCoinType(coinType: string): string {
  if (coinType.includes('SupraCoin')) return 'SUPRA'
  if (coinType.includes('USDC')) return 'USDC'
  const parts = coinType.split('::')
  return parts[parts.length - 1] ?? 'TOKEN'
}

interface AccountResource {
  type: string
  data: Record<string, unknown>
}

interface RawTx {
  status?: string
  txHash: string
  txConfirmationTime?: number | string
  transactionInsights?: { function?: string }
}

export async function readStrategies(owner: string, supraPrice: number): Promise<Strategy[]> {
  if (!MODULE_ADDRESS) return []

  const client = await getSupraClient()

  try {
    const resourcesResult = (await client.getAccountResources(HexString.ensure(owner), {
      count: 100,
    })) as { resources: AccountResource[] }

    const strategyResources = resourcesResult.resources.filter((r) =>
      r.type.includes('::strategy::LimitBuyStrategy'),
    )

    return strategyResources.map((resource, index) => {
      const data = resource.data as Record<string, unknown>
      const typeMatch = resource.type.match(/LimitBuyStrategy<(.+)>/)
      const typeArgs = typeMatch
        ? typeMatch[1].split(',').map((s: string) => s.trim())
        : []
      const baseAsset = typeArgs[0] ? symbolFromCoinType(typeArgs[0]) : 'SUPRA'
      const quoteAsset = typeArgs[1] ? symbolFromCoinType(typeArgs[1]) : 'USDC'

      const quantity = Number(normalizeBigInt(data.quantity))
      const triggerPrice = Number(normalizeBigInt(data.trigger_price)) / 1e18
      const active = Boolean(data.active)
      const lastExecuted = Number(normalizeBigInt(data.last_executed))

      return {
        id: `${resource.type}-${index}`,
        name: `${active ? 'Active' : 'Closed'} ${baseAsset} strategy`,
        intent: `${active ? 'Buy' : 'Bought'} ${quantity.toLocaleString()} ${baseAsset} at $${triggerPrice.toFixed(6)}`,
        action: 'BUY' as const,
        baseAsset,
        quoteAsset,
        quantity,
        triggerPrice,
        currentPrice: baseAsset === 'SUPRA' ? supraPrice : 0,
        status: active ? 'active' : lastExecuted > 0 ? 'executed' : 'cancelled',
        createdAt: new Date(),
        lastExecuted: lastExecuted > 0 ? new Date(lastExecuted * 1000) : undefined,
      }
    })
  } catch (e) {
    log('readStrategies failed', e)
    return []
  }
}

export async function readActivity(owner: string): Promise<Activity[]> {
  const client = await getSupraClient()

  try {
    const txs = (await client.getAccountTransactionsDetail(HexString.ensure(owner), {
      count: 20,
    })) as RawTx[]

    return txs.map((tx) => {
      const status =
        tx.status === 'Success'
          ? 'executed'
          : tx.status === 'Failed'
            ? 'failed'
            : 'registered'

      const confirmation = tx.txConfirmationTime

      return {
        id: tx.txHash,
        strategyName: tx.transactionInsights?.function ?? 'On-chain transaction',
        status,
        txHash: tx.txHash,
        timestamp: confirmation ? new Date(Number(confirmation) / 1000) : new Date(),
      }
    })
  } catch (e) {
    log('readActivity failed', e)
    return []
  }
}

/* ---------------------------------------------------------------- */
/*  Transactions                                                    */
/* ---------------------------------------------------------------- */

async function ensureUserRegistered(owner: string) {
  assertModuleAddress()
  const client = await getSupraClient()

  try {
    await client.getResourceData(
      HexString.ensure(owner),
      `${MODULE_ADDRESS}::vault::UserVault`,
    )
    return
  } catch {
    // not registered
  }

  await signAndSend(owner, 'vault', 'register_user', [], [])
}

async function signAndSend(
  owner: string,
  moduleName: string,
  functionName: string,
  typeArguments: string[],
  functionArguments: Uint8Array[],
) {
  assertModuleAddress()

  const provider = getStarKeyProvider()
  if (!provider) throw new Error('StarKey is not connected')

  const client = await getSupraClient()

  let sequenceNumber: bigint
  try {
    const accountInfo = await client.getAccountInfo(HexString.ensure(owner))
    sequenceNumber = accountInfo.sequence_number
  } catch {
    throw new Error('Wallet account is not active on Supra. Fund it first.')
  }

  const rawTx = await client.createRawTxObject(
    HexString.ensure(owner),
    sequenceNumber,
    MODULE_ADDRESS,
    moduleName,
    functionName,
    typeArguments,
    functionArguments,
  )

  const rawTxBytes = BCS.bcsToBytes(rawTx)

  const signed = await provider.signTransaction({
    data: rawTxBytes,
    from: owner,
    to: MODULE_ADDRESS,
    value: 0,
    chainId: CHAIN_ID,
  })

  if (!signed?.Ed25519) {
    throw new Error('StarKey did not return an Ed25519 signature')
  }

  return client.sendTxUsingSerializedRawTransactionAndSignature(
    signed.Ed25519.public_key,
    signed.Ed25519.signature,
    rawTxBytes,
    {
      enableWaitForTransaction: true,
      enableTransactionSimulation: true,
    },
  )
}

export async function depositToVault(owner: string, coinType: string, amountRaw: bigint) {
  await ensureUserRegistered(owner)
  return signAndSend(owner, 'vault', 'deposit', [coinType], [BCS.bcsSerializeUint64(amountRaw)])
}

export async function withdrawFromVault(owner: string, coinType: string, amountRaw: bigint) {
  return signAndSend(owner, 'vault', 'withdraw', [coinType], [BCS.bcsSerializeUint64(amountRaw)])
}

export async function createStrategyOnChain(params: {
  owner: string
  baseCoinType: string
  quoteCoinType: string
  quantityRaw: bigint
  triggerPriceRaw: bigint
}) {
  return signAndSend(
    params.owner,
    'strategy',
    'create_limit_buy',
    [params.baseCoinType, params.quoteCoinType],
    [
      BCS.bcsSerializeUint64(params.quantityRaw),
      BCS.bcsSerializeUint64(params.triggerPriceRaw),
    ],
  )
}

export async function cancelStrategyOnChain(params: {
  owner: string
  baseCoinType: string
  quoteCoinType: string
}) {
  return signAndSend(
    params.owner,
    'strategy',
    'cancel',
    [params.baseCoinType, params.quoteCoinType],
    [],
  )
}
