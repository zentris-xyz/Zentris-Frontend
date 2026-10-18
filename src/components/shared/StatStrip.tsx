interface Item {
  label: string
  value: string
  delta?: string
  positive?: boolean
}

export function StatStrip({ items }: { items: Item[] }) {
  return (
    <div className="grid grid-cols-2 divide-x divide-line border-y border-line md:grid-cols-4">
      {items.map((it, i) => (
        <div
          key={it.label}
          className={`px-4 py-3 ${i < 2 ? 'border-b border-line md:border-b-0' : ''}`}
        >
          <div className="text-2xs uppercase tracking-wider text-text-faint">{it.label}</div>
          <div className="mt-1 font-mono text-xl text-text tabnum">{it.value}</div>
          {it.delta && (
            <div className={`text-xs font-mono ${it.positive ? 'text-success' : 'text-text-muted'}`}>
              {it.delta}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
