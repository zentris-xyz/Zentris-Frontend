# Zentris — How It Works

A plain-language walkthrough of what happens when a user creates a strategy, and what happens every time Supra AutoFi executes it.

## Overview

Zentris has three layers that work together:

| Layer | Runs where | Responsibility |
|---|---|---|
| **Intent Layer** | Off-chain (AI agent) | Understands natural language and produces structured parameters |
| **Execution Layer** | On-chain (Move contract) | Stores strategies, reads prices, executes swaps |
| **Automation Layer** | Supra validators | Triggers execution natively, no external keepers |

The user only interacts with the first and last: they describe what they want, and later they see the result. Everything in between is verifiable on-chain.

## The Complete Flow

```
User writes intent
     ↓
AI agent parses and validates
     ↓
User reviews and signs
     ↓
Move contract stores strategy
     ↓
Registered with Supra Automation Registry
     ↓
Supra validators trigger execute_limit_buy
     ↓
Contract reads Supra Oracle
     ↓
Condition met? → Swap via DEX → Update balances
Condition not met? → Do nothing, stay active
```

## Step by Step

### Step 1 — Deposit SUPRA

Before creating any strategy, the user deposits SUPRA into the Zentris vault.

```
User wallet → vault::deposit<SupraCoin>(amount) → Zentris Vault
```

What happens on-chain:
- SUPRA moves from the user's wallet to the vault's resource account.
- A `UserVault` entry is created (or updated) with the user's balance.
- The funds remain under the user's control — only the user can withdraw.

What does **not** happen:
- Zentris does not take custody in the legal or operational sense.
- The AI agent never touches these funds.

### Step 2 — Describe the strategy

The user writes something like:

> "Buy 1,000 SUPRA if price drops 5% from 0.001. If price rises above target, do not buy — wait until it truly drops."

This text goes to the off-chain AI agent.

### Step 3 — Parse the intent

The AI agent converts the sentence into a structured schema:

```json
{
  "action": "BUY",
  "base_asset": "SUPRA",
  "quote_asset": "USDC",
  "quantity": 1000,
  "reference_price": 0.001,
  "trigger_price": 0.00095,
  "persistence": "until_filled",
  "max_slippage_bps": 50
}
```

Validation at this stage:
- Action must be `BUY` or `SELL`.
- Assets must be whitelisted in `registry`.
- Quantity and trigger must be within safe bounds.
- The user's vault balance must be sufficient.

If validation fails, the user sees a clear error and can edit the intent before signing anything.

### Step 4 — Review and sign

The frontend shows the parsed parameters in human-readable form:

```
Action        BUY
Asset         SUPRA
Quantity      1,000
Pay with      USDC
Trigger       $0.000950
Reference     $0.001000
Persistence   until filled

Estimated cost   0.95 USDC
Zentris fee      0.001 USDC
```

The user signs a transaction calling:

```move
strategy::create_limit_buy<SupraCoin, USDCCoin>(
    quantity: 1000_00000000,
    trigger_price: 950_000000000000
)
```

What happens on-chain:
- A `LimitBuyStrategy<SUPRA, USDC>` resource is created at the user's address.
- Fields stored: owner, quantity, trigger price, active flag, last executed timestamp.

### Step 5 — Register with Supra AutoFi

The AI agent (or the user, via CLI) registers `execute_limit_buy` with the **Supra Automation Registry**:

```
Task:
  function: strategy::execute_limit_buy<SUPRA, USDC>
  argument: <user address>
  schedule: every epoch
  max gas: 50,000
  expiry: 30 days
```

From this point forward, the user no longer needs to do anything. No bot runs on their machine. No keeper needs to be paid.

### Step 6 — Automated execution

Every epoch, Supra validators call:

```move
strategy::execute_limit_buy<SupraCoin, USDCCoin>(owner: address)
```

Inside the function:

1. **Check active flag.** If the user paused or cancelled, exit immediately.
2. **Read price from Supra Oracle.**
   ```move
   let (price, _decimals, _round, _timestamp) =
       supra_oracle_storage::get_price(SUPRA_USDC_PAIR_ID);
   ```
3. **Compare price to trigger.**
   - If `price > trigger_price`, do nothing and stay active. This is the "wait until it truly drops" behavior.
   - If `price <= trigger_price`, continue to step 4.
4. **Check user balance.** If vault balance < quantity, exit and stay active.
5. **Withdraw quote from vault.** USDC moves from the vault into the execution context.
6. **Swap via DEX router.**
   ```move
   let base_coin = router::swap_exact_coin_for_coin<USDC, SUPRA>(
       quote_coin,
       min_supra_out
   );
   ```
7. **Deposit result back to vault.** The purchased SUPRA is credited to the user's `UserVault`.
8. **Mark strategy as executed.** `active = false` for one-shot limit buys, or `last_executed = now` for recurring DCA.

Every step above is verifiable on SupraScan. The user can inspect exactly which price was read, how much was swapped, and what fee was paid.

### Step 7 — Withdraw or continue

After execution, the user can:

- **Withdraw** the purchased SUPRA back to their wallet.
- **Create another strategy** using the remaining balance.
- **Leave funds in the vault** for future strategies.

Withdrawal works the same way as deposit, in reverse:

```move
vault::withdraw<SupraCoin>(amount) → User wallet
```

## What Makes This Different from a Bot

A traditional trading bot on Ethereum or Solana requires:

- A server that runs 24/7.
- Gas funds kept in a hot wallet.
- Retry logic for failed transactions.
- Protection against MEV and front-running.
- Trust that the operator won't rug.

Zentris removes all five:

| Traditional bot | Zentris |
|---|---|
| Runs on a VPS | Runs on Supra validators |
| Needs funded wallet | Uses user's vault balance |
| Manual retry | AutoFi retries natively |
| MEV vulnerable | Executed inside validator block |
| Custodial | Non-custodial vault |

## Why Supra Specifically

The same strategy on Ethereum would require:

- Chainlink for price data.
- Gelato or Chainlink Automation for execution.
- A keeper wallet with ETH.
- Custom retry and monitoring.

On Supra, all four are native:

- **Supra Oracle** — price feeds built into the L1.
- **Supra AutoFi** — execution registered at the validator level.
- **Native SUPRA** — gas paid from the same vault.
- **MoveVM** — type-safe strategy contracts.

Zentris is not "a bot that happens to run on Supra." It is a platform that only exists because Supra provides these primitives.

## Safety Mechanisms

**Before execution:**
- AI parser validates schema before the user signs.
- Simulation shows estimated cost, slippage, and fees.
- User signature is required for every new strategy.

**During execution:**
- Oracle sanity check rejects price = 0.
- Balance check prevents overdraw.
- Slippage protection via `min_amount_out`.
- Only whitelisted assets can be traded.

**After execution:**
- `active` flag can be toggled by the user at any time.
- Failed executions leave the strategy active; they do not lose funds.
- Every action emits an event readable on SupraScan.

**What the AI agent cannot do:**
- Move user funds.
- Change strategy logic.
- Bypass the registry.
- Execute without a registered automation task.

## Example Walkthrough

Let's follow Alice through the full cycle.

**Day 0 — Alice deposits 500 USDC and 10,000 SUPRA.**

She wants to buy more SUPRA on dips, but does not want to watch charts.

**Day 0 — Alice writes:**

> "Buy 1,000 SUPRA if price drops 5% from 0.001. If price rises above target, do not buy — wait until it truly drops."

**Day 0 — AI parses, Alice signs, strategy registers with AutoFi.**

Current price: $0.001000. Trigger: $0.000950.

**Day 1 — Price is $0.001020. No execution.**

Validator calls `execute_limit_buy`. Contract reads price. `$0.001020 > $0.000950`, so it returns early. Strategy stays active. No gas charged to Alice beyond the automation fee cap.

**Day 2 — Price drops to $0.000940. Execution triggers.**

- Validator calls `execute_limit_buy`.
- Contract reads price: $0.000940.
- `$0.000940 <= $0.000950`, so it proceeds.
- Vault withdraws 0.95 USDC (1,000 × $0.000950 for accounting purposes; actual cost varies with market).
- DEX swap executes at market price.
- Alice receives approximately 1,010 SUPRA (assuming favorable slippage).
- Strategy marked executed.

**Day 3 — Alice sees the result.**

On the Activity page:

```
executed    Buy SUPRA on dip    1,010 SUPRA    $0.000940    0x8a3f...9c2e    12h ago
```

She clicks the transaction hash and sees the full on-chain trace on SupraScan.

**Day 4 — Alice withdraws her SUPRA.**

She calls `vault::withdraw<SupraCoin>` and the funds return to her wallet. Non-custodial throughout.

## What Runs Where

| Component | Runs on | Verifiable by |
|---|---|---|
| Natural language parsing | Off-chain (AI agent) | User (before signing) |
| Strategy storage | Supra MoveVM | SupraScan |
| Price reading | Supra Oracle | SupraScan |
| Execution trigger | Supra validators | SupraScan |
| Swap | DEX Move contract | SupraScan |
| Fee collection | Zentris Fee Vault | SupraScan |
| Notifications | Off-chain | Not trust-critical |

The only off-chain component that affects outcomes is the AI parser — and its output is shown to the user **before** anything is signed. If the parser misunderstands, the user sees the mistake and cancels.

## Summary

1. User deposits SUPRA.
2. User describes a strategy in plain English.
3. AI agent parses it into parameters.
4. User reviews and signs.
5. Strategy registers with Supra AutoFi.
6. Validators execute it automatically when conditions are met.
7. User withdraws whenever they want.

No bots. No keepers. No custody. Everything verifiable on-chain.
