import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export function Settings() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-text-muted">Wallet, notifications, and network</p>
      </div>

      <Section title="Wallet">
        <Row label="Address" value={<span className="font-mono text-xs">0x8a3f…7f8a</span>} />
        <Row label="Network" value={<span className="flex items-center gap-1.5 text-xs"><span className="h-1.5 w-1.5 rounded-full bg-success" /> Supra Testnet</span>} />
        <div className="flex justify-end pt-2">
          <Button variant="secondary" size="sm">Disconnect</Button>
        </div>
      </Section>

      <Section title="Notifications">
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs text-text-muted">Telegram</label>
            <Input placeholder="@handle" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-text-muted">Email</label>
            <Input type="email" placeholder="you@example.com" />
          </div>
          {['On execution', 'On failure', 'Near trigger'].map((label) => (
            <label key={label} className="flex items-center justify-between border-t border-line pt-3 text-sm">
              <span className="text-text-muted">{label}</span>
              <input type="checkbox" defaultChecked className="h-3.5 w-3.5 accent-[#c6f24e]" />
            </label>
          ))}
        </div>
      </Section>

      <Section title="Security">
        <p className="text-sm leading-relaxed text-text-muted">
          Zentris is non-custodial. Funds remain in the on-chain vault contract and only you can withdraw. The AI parser cannot move funds or alter strategy logic.
        </p>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-medium text-text">{title}</h2>
      <div className="rounded border border-line bg-surface p-4">{children}</div>
    </section>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-line py-2.5 last:border-b-0">
      <span className="text-sm text-text-muted">{label}</span>
      <span>{value}</span>
    </div>
  )
}
