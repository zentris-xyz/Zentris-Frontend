/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_SUPRA_RPC?: string
  readonly VITE_SUPRA_CHAIN_ID?: string
  readonly VITE_ZENTRIS_MODULE_ADDRESS?: string
  readonly VITE_USDC_COIN_TYPE?: string
  readonly VITE_SUPRA_PRICE_PAIR?: string
  readonly VITE_DEBUG_SUPRA?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
