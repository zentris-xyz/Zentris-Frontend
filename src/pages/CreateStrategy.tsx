import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Sparkles, Loader2, Check, AlertCircle } from 'lucide-react'
import { Panel } from '../components/ui/Panel'
import { Button } from '../components/ui/Button'
import { Textarea } from '../components/ui/Input'
import { parseIntent, type ParsedIntent } from '../lib/mock'

type Step = 'input' | 'review' | 'signing' | 'success'

const examples = [
  'Buy 1,000 SUPRA if price drops 5% from 0.001. If price rises above target, do not buy — wait until it truly drops.',
  'Buy 500 SUPRA every Monday at 08:00 UTC.',
  'Sell 2,000 SUPRA when price reaches 0.0015.',
]

export function CreateStrategy() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('input')
  const [intent, setIntent] = useState('')
  const [parsed, setParsed] = useState<ParsedIntent | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleParse = async () => {
    if (!intent.trim()) {
      setError('Describe your strategy first.')
      return
    }
    setError('')
    setLoading(true)
    try {
      setParsed(await parseIntent(intent))
      setStep('review')
    } finally {
      setLoading(false)
    }
  }

  const handleSign = async () => {
    setStep('signing')
    await new Promise((r) => setTimeout(r, 1600))
    setStep('success')
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

      {step === 'input' && (
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs text-text-muted">Intent</label>
            <Textarea
              rows={4}
              placeholder="Buy 1,000 SUPRA if price drops 5% from 0.001..."
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
            />
            {error && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-danger">
                <AlertCircle size={12} /> {error}
              </div>
            )}
          </div>

          <div>
            <div className="mb-2 text-2xs uppercase tracking-wider text-text-faint">Examples</div>
            <div className="space-y-1.5">
              {examples.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setIntent(ex)}
                  className="w-full rounded border border-line bg-surface px-3 py-2 text-left text-xs text-text-muted transition-colors hover:border-line-strong hover:text-text"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          <Button className="w-full" onClick={handleParse} disabled={loading}>
            {loading ? (
              <><Loader2 size={14} className="animate-spin" /> Parsing…</>
            ) : (
              <><Sparkles size={14} /> Parse intent</>
            )}
          </Button>
        </div>
      )}

      {step === 'review' && parsed && (
        <div className="space-y-4">
          <Panel className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium">Parsed</h2>
              <span className="text-xs text-text-muted tabnum">{Math.round(parsed.confidence * 100)}% confidence</span>
            </div>
            <dl className="divide-y divide-line text-sm">
              <Row label="Action" value={parsed.action} />
              <Row label="Asset" value={parsed.baseAsset} />
              <Row label="Quantity" value={parsed.quantity.toLocaleString()} mono />
              <Row label="Pay with" value={parsed.quoteAsset} />
              <Row label="Trigger" value={`$${parsed.triggerPrice.toFixed(6)}`} mono />
              <Row label="Reference" value={`$${parsed.referencePrice.toFixed(6)}`} mono />
              <Row label="Persistence" value={parsed.persistence} />
            </dl>
          </Panel>

          <Panel className="p-4">
            <h3 className="mb-3 text-xs uppercase tracking-wider text-text-faint">Simulation</h3>
            <dl className="divide-y divide-line text-sm">
              <Row label="Cost" value={`${(parsed.quantity * parsed.triggerPrice).toFixed(2)} USDC`} mono />
              <Row label="Slippage" value="0.3%" mono />
              <Row label="Gas" value="~0.002 SUPRA" mono />
              <Row label="Fee" value="0.1%" mono />
            </dl>
          </Panel>

          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => { setStep('input'); setParsed(null) }}>
              Edit
            </Button>
            <Button className="flex-1" onClick={handleSign}>
              Sign & activate
            </Button>
          </div>
        </div>
      )}

      {step === 'signing' && (
        <Panel className="flex flex-col items-center justify-center py-16 text-center">
          <Loader2 size={24} className="animate-spin text-accent" />
          <p className="mt-4 text-sm text-text">Registering with Supra AutoFi…</p>
          <p className="mt-1 text-xs text-text-muted">Validators will execute automatically</p>
        </Panel>
      )}

      {step === 'success' && (
        <Panel className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10 text-success">
            <Check size={20} />
          </div>
          <h2 className="mt-4 text-lg font-medium">Strategy live</h2>
          <p className="mt-1 max-w-xs text-xs text-text-muted">
            Zentris will execute automatically when conditions are met.
          </p>
          <div className="mt-6 flex gap-2">
            <Button variant="secondary" onClick={() => navigate('/strategies')}>View strategies</Button>
            <Button onClick={() => { setStep('input'); setIntent(''); setParsed(null) }}>Create another</Button>
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
