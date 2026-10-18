# Zentris Frontend

Web app for **Zentris** — an intent-based AutoFi agent on Supra. Users describe strategies in natural language; contracts execute them autonomously via Supra Oracle and Supra AutoFi.

Built with **Vite + React + TypeScript + Tailwind CSS**.

## Stack

| Layer | Technology |
|---|---|
| Build tool | Vite 5 |
| Framework | React 18 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| Routing | React Router 6 |
| Icons | Lucide React |
| Utilities | clsx + tailwind-merge |

## Design System

| Token | Value | Usage |
|---|---|---|
| Background | `#0a0a0b` | Page base |
| Surface | `#111112` | Panels, cards |
| Raised | `#17171a` | Hovered rows, inputs |
| Line | `#232326` | Borders |
| Text | `#e8e8ea` | Primary text |
| Text muted | `#8a8a90` | Secondary text |
| Accent | `#c6f24e` | Primary button, active state |
| Success | `#4ade80` | Positive change, active dot |
| Danger | `#f87171` | Errors, destructive actions |

Rules:
- Accent color appears **once per screen** (primary button or active state).
- All numbers use `font-mono` + `tabular-nums`.
- Radius capped at `6px`. No drop shadows except dropdown menus.
- Density is tight: `13px` base font, `40px` row height.

## Quick Start

```bash
# Install
npm install

# Dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Open [http://localhost:5173](http://localhost:5173).

## Project Structure

```
zentris-frontend/
├── index.html                  SEO meta, OG tags, JSON-LD
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── public/
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── site.webmanifest
│   ├── browserconfig.xml
│   ├── favicon.svg
│   └── og-image.png           (1200×630, required for social preview)
└── src/
    ├── main.tsx                Entry point
    ├── App.tsx                 Router + layout
    ├── index.css               Tailwind + base styles
    ├── types/
    │   └── index.ts            Shared TypeScript types
    ├── lib/
    │   ├── utils.ts            cn(), formatters
    │   └── mock.ts             Mock data + parseIntent()
    ├── components/
    │   ├── layout/
    │   │   ├── Navbar.tsx      Desktop top nav
    │   │   ├── BottomNav.tsx   Mobile bottom nav
    │   │   └── AppLayout.tsx   Shell wrapper
    │   ├── ui/
    │   │   ├── Button.tsx
    │   │   ├── Panel.tsx
    │   │   ├── Input.tsx       Input + Textarea
    │   │   ├── Modal.tsx
    │   │   └── StatusDot.tsx
    │   └── shared/
    │       ├── StatStrip.tsx
    │       └── StrategyRow.tsx
    └── pages/
        ├── Dashboard.tsx
        ├── Vault.tsx
        ├── Strategies.tsx
        ├── CreateStrategy.tsx
        ├── Activity.tsx
        └── Settings.tsx
```

## Routes

| Path | Page | Purpose |
|---|---|---|
| `/` | Dashboard | Portfolio overview, active strategies, recent activity |
| `/vault` | Vault | Deposit/withdraw SUPRA and future tokens |
| `/strategies` | Strategies | List, filter, pause, cancel strategies |
| `/strategies/create` | Create Strategy | Natural-language intent → on-chain strategy |
| `/activity` | Activity | On-chain execution history |
| `/settings` | Settings | Wallet, notifications, network |

## Responsive Behavior

| Breakpoint | Navigation |
|---|---|
| `< 768px` | Bottom nav (5 tabs, safe-area aware) |
| `≥ 768px` | Top navbar (horizontal links) |

Tables switch to stacked cards below `768px`. Vault rows use two-column layout on mobile.

## Mock Data

The app ships with mock data in `src/lib/mock.ts` so it runs without a backend. Replace these when connecting to Supra:

| Mock | Replace with |
|---|---|
| `mockAssets` | `vault::balance_of<T>()` RPC calls |
| `mockStrategies` | Indexed events from `strategy::create_limit_buy` |
| `mockActivity` | Indexed events from `strategy::execute_limit_buy` |
| `parseIntent()` | `POST /api/parse-intent` → LLM |
| `handleSign()` timeout | Wallet `signAndSubmitTransaction()` |

## Connecting to Supra (Next Steps)

### 1. Wallet

Install the Supra wallet SDK:

```bash
npm install @supra-labs/wallet-sdk
```

Wrap the app with the provider in `src/main.tsx`:

```tsx
<SupraWalletProvider network="testnet">
  <App />
</SupraWalletProvider>
```

Replace the hardcoded address in `Navbar.tsx` with `useSupraWallet()`.

### 2. Read vault balances

Replace `mockAssets` with a query using the Supra L1 SDK:

```ts
const balance = await supraClient.viewFunction({
  function: `${MODULE_ADDR}::vault::balance_of`,
  typeArguments: ['0x1::supra_coin::SupraCoin'],
  arguments: [userAddress],
});
```

### 3. Create strategies

Replace `handleSign` in `CreateStrategy.tsx`:

```ts
const payload = {
  function: `${MODULE_ADDR}::strategy::create_limit_buy`,
  typeArguments: ['0x1::supra_coin::SupraCoin', '0x1::usdc::USDC'],
  arguments: [String(parsed.quantity), String(parsed.triggerPrice)],
};
const tx = await signAndSubmitTransaction(payload);
```

### 4. AI intent parser

Create `api/parse-intent.ts` (or a separate backend):

```ts
// POST /api/parse-intent
// Body: { text: string }
// Returns: ParsedIntent
```

Use any LLM with a JSON schema. Keep the API key server-side — never in the browser.

## SEO

`index.html` includes:

- Primary meta tags (title, description, keywords)
- Open Graph + Twitter Card
- Canonical URL
- JSON-LD: `Organization`, `WebSite`, `WebApplication`, `FAQPage`
- `robots.txt`, `sitemap.xml`, `site.webmanifest`

**Before deploying**, replace:

| Placeholder | With |
|---|---|
| `https://zentris.xyz` | Your production domain |
| `https://app.zentris.xyz` | App subdomain |
| `@zentrisfi` | Your X handle |
| `https://github.com/zentrisfi` | Your GitHub org |
| `og-image.png` | Actual 1200×630 image |

Validate with:

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [OpenGraph.xyz](https://www.opengraph.xyz/)
- [PageSpeed Insights](https://pagespeed.web.dev/)

## Deployment

### Vercel (recommended)

```bash
npm i -g vercel
vercel
```

Framework preset: **Vite**. Build command: `npm run build`. Output: `dist`.

### Netlify

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Self-hosted

```bash
npm run build
# serve dist/ behind nginx, Caddy, or any static host
```

SPA fallback is required: all unknown routes must serve `index.html`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server on port 5173 |
| `npm run build` | Type-check + production build to `dist/` |
| `npm run preview` | Preview the production build locally |

## Environment Variables

Create `.env.local` for local development:

```env
VITE_SUPRA_RPC=https://rpc-testnet.supra.com
VITE_MODULE_ADDRESS=0xabc...
VITE_ORACLE_PAIR_SUPRA_USDC=...
VITE_LLM_ENDPOINT=https://api.zentris.xyz/parse-intent
```

Access in code via `import.meta.env.VITE_*`. Never expose private keys or secret API keys to the frontend.

## Browser Support

- Chrome / Edge ≥ 110
- Firefox ≥ 110
- Safari ≥ 16
- Mobile Safari iOS ≥ 16
- Chrome Android ≥ 110

## Contributing

1. Fork the repo.
2. Create a branch: `git checkout -b feat/your-feature`.
3. Follow the design system (do not introduce new colors or radii).
4. Run `npm run build` before opening a PR.
5. Open a PR with a description of the change and a screenshot.

## License

[MIT](../LICENSE)
