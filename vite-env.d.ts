/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPRA_CHAIN_ID?: string
  readonly VITE_SUPRA_RPC?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
