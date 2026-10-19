export interface StarKeyConnectOptions {
  chainId?: number
  multiple?: boolean
}

export interface StarKeySignTransactionPayload {
  data: Uint8Array
  from: string
  to?: string
  value?: string | number
  chainId: number
}

export interface StarKeySignedAuthenticator {
  Ed25519: {
    public_key: string
    signature: string
  }
}

export interface StarKeyProvider {
  connect(options?: StarKeyConnectOptions): Promise<string[]>
  account(): Promise<string[]>
  disconnect(): Promise<void>
  getChainId(): Promise<{ chainId: string } | null>
  changeNetwork(options: { chainId: string | number }): Promise<{ chainId: string }>

  signTransaction(payload: StarKeySignTransactionPayload): Promise<StarKeySignedAuthenticator>
  sendTransaction(params: {
    from: string
    to: string
    chainId: number
    value: string | number
    options?: { waitForTransaction?: boolean }
  }): Promise<string>

  waitForTransactionWithResult(params: { hash: string }): Promise<{
    hash: string
    status: 'Success' | 'Failed'
    vmStatus: string
  } | null>

  on(event: 'accountChanged', handler: (accounts: string[]) => void): void
  on(event: 'networkChanged', handler: (data: { chainId: number }) => void): void
  on(event: 'disconnect', handler: () => void): void
  removeListener?(event: string, handler: (...args: unknown[]) => void): void
}

export interface StarKeyInjected {
  supra?: StarKeyProvider
  ethereum?: unknown
}

declare global {
  interface Window {
    starkey?: StarKeyInjected
  }
}
