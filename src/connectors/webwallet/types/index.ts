import type { Theme } from "../starknetWindowObject/argentStarknetWindowObject"

declare global {
  interface Window {
    google: any
  }
}

export interface WebWalletConnectorOptions {
  url?: string
  theme?: Theme
  ssoToken?: string
  authorizedPartyId?: string
}

export interface WebwalletGoogleAuthOptions extends WebWalletConnectorOptions {
  clientId: string
  authorizedPartyId?: string
}
