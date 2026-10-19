import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Sparkles, Loader2, Check, AlertCircle } from 'lucide-react'
import { Panel } from '../components/ui/Panel'
import { Button } from '../components/ui/Button'
import { Textarea } from '../components/ui/Input'
import { useWallet } from '../context/WalletContext'
import { parseIntent } from '../lib/intent'
import {
  createStrategyOnChain,
  SUPRA_COIN_TYPE,
  USDC_COIN_TYPE,
} from '../lib/supra'
import { registerStrategyWithBackend } from '../lib/api'
import { toRawAmount } from '../lib/utils'
import type { ParsedIntent } from '../types'

type Step = 'input' | 'review' | 'signing' | 'success'

const examples = [
  'Buy 1,000 SUPRA if price drops 5% from 0.001. If price rises above target, do not buy — wait until it truly drops.',
  'Buy 500 SUPRA if price drops 10% from 0.001.',
  'Buy 2,000 SUPRA if price drops 20% from 0.001.',
]

export function CreateStrategy() {
  const navigate = useNavigate()
  const { address, isConnected } = useWallet()

  const [step, setStep] = useState<Step>('input')
  const [intent, setIntent] = useState('')
  const [parsed, setParsed] = useState<ParsedIntent | null>(null)
  const [error, setError] = useState('')
  const [txHash, setTxHash] = useState('')
  const [parsing, setParsing] = useState(false)

  const handleParse = async () => {
    if (!intent.trim()) {
      setError('Describe your strategy first.')
      return
    }

    setError('')
    setParsing(true)

    try {
      const result = await parseIntent(intent)
      if (result.quantity <= 0 || result.triggerPrice <= 0) {
        setError('Could not extract quantity and trigger price. Try an example.')
        return
      }
      setParsed(result)
      setStep('review')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse intent')
    } finally {
      setParsing(false)
    }
  }

  const handleSign = async () => {
    if (!address || !parsed) return
    if (!USDC_COIN_TYPE) {
      setError('USDC coin type is not configured.')
      return
    }

    setStep('signing')
    setError('')

    try {
      const quantityRaw = toRawAmount(parsed.quantity, 8)
      const triggerRaw = toRawAmount(parsed.triggerPrice, 18)

      const result = await createStrategyOnChain({
        owner: address,
        baseCoinType: SUPRA_COIN_TYPE,
        quoteCoinType: USDC_COIN_TYPE,
        quantityRaw,
        triggerPriceRaw: triggerRaw,
      })

      setTxHash(result.txHash)

      // Non-blocking: register with backend so leaderboard can index it.
      void registerStrategyWithBackend({
        owner: address,
        baseAsset: parsed.baseAsset,
        quoteAsset: parsed.quoteAsset,
        baseCoinType: SUPRA_COIN_TYPE,
        quoteCoinType: USDC_COIN_TYPE,
        quantityRaw: String(quantityRaw),
        triggerPriceRaw: String(triggerRaw),
        intent,
        txHash: result.txHash,
        referredBy: localStorage.getItem('zentris_ref') ?? undefined,
      })

      setStep('success')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Transaction failed')
      setStep('review')
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/strategies')}
          className="flex h-7 w-7 items-center justify-center rounded border border-line bg-surface text-text-muted hover:bg-raised hover:text-text"
        >
          <ArrowLeft size={14} />
        </button>
        <div>
          <h1 className="text-lg font-medium tracking-tight">Create strategy</h1>
          <p className="text-xs text-text-muted">Describe it in plain English</p>
        </div>
      </div>

      {!isConnected && (
        <Panel className="p-4 text-sm text-text-muted">
          Connect StarKey before creating a strategy.
        </Panel>
      )}

      {step === 'input' && (
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs text-text-muted">Intent</label>
            <Textarea
              rows={4}
              placeholder="Buy 1,000 SUPRA if price drops 5% from 0.001..."
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              disabled={parsing}
            />
            {error && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-danger">
                <AlertCircle size={12} /> {error}
              </div>
            )}
          </div>

          <div>
            <div className="mb-2 text-2xs uppercase tracking-wider text-text-faint">
              Examples
            </div>
            <div className="space-y-1.5">
              {examples.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setIntent(ex)}
                  disabled={parsing}
                  className="w-full rounded border border-line bg-surface px-3 py-2 text-left text-xs text-text-muted transition-colors hover:border-line-strong hover:text-text disabled:opacity-50"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          <Button className="w-full" onClick={() => void handleParse()} disabled={parsing}>
            {parsing ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Parsing…
              </>
            ) : (
              <>
                <Sparkles size={14} /> Parse intent
              </>
            )}
          </Button>
        </div>
      )}

      {step === 'review' && parsed && (
        <div className="space-y-4">
          <Panel className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium">Parsed</h2>
              <span className="text-xs text-text-muted tabnum">
                {Math.round(parsed.confidence * 100)}% confidence
              </span>
            </div>
            <dl className="divide-y divide-line text-sm">
              <Row label="Action" value={parsed.action} />
              <Row label="Asset" value={parsed.baseAsset} />
              <Row label="Quantity" value={parsed.quantity.toLocaleString()} mono />
              <Row label="Pay with" value={parsed.quoteAsset} />
              <Row label="Trigger" value={`$${parsed.triggerPrice.toFixed(6)}`} mono />
              <Row
                label="Reference"
                value={parsed.referencePrice > 0 ? `$${parsed.referencePrice.toFixed(6)}` : '—'}
                mono
              />
              <Row label="Persistence" value={parsed.persistence} />
            </dl>
          </Panel>

          {error && <p className="text-xs text-danger">{error}</p>}

          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setStep('input')
                setParsed(null)
              }}
            >
              Edit
            </Button>
            <Button
              className="flex-1"
              onClick={() => void handleSign()}
              disabled={!isConnected}
            >
              Sign & activate
            </Button>
          </div>
        </div>
      )}

      {step === 'signing' && (
        <Panel className="flex flex-col items-center justify-center py-16 text-center">
          <Loader2 size={24} className="animate-spin text-accent" />
          <p className="mt-4 text-sm text-text">Confirm in StarKey…</p>
          <p className="mt-1 text-xs text-text-muted">Creating your strategy on Supra</p>
        </Panel>
      )}

      {step === 'success' && (
        <Panel className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10 text-success">
            <Check size={20} />
          </div>
          <h2 className="mt-4 text-lg font-medium">Strategy created</h2>
          <p className="mt-1 max-w-xs text-xs text-text-muted">
            The strategy is stored on-chain. Register it with Supra AutoFi to enable automatic execution.
          </p>
          {txHash && (
            <a
              href={`https://suprascan.io/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 font-mono text-2xs text-accent hover:underline"
            >
              {txHash.slice(0, 20)}…
            </a>
          )}
          <div className="mt-6 flex gap-2">
            <Button variant="secondary" onClick={() => navigate('/strategies')}>
              View strategies
            </Button>
            <Button
              onClick={() => {
                setStep('input')
                setIntent('')
                setParsed(null)
                setTxHash('')
              }}
            >
              Create another
            </Button>
          </div>
        </Panel>
      )}
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2">
      <dt className="text-text-muted">{label}</dt>
      <dd className={mono ? 'font-mono tabnum' : ''}>{value}</dd>
    </div>
  )
}
