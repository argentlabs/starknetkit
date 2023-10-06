import type { GetWalletOptions } from "get-starknet-core"
import type { Connector } from "../connectors/connector"
import type { ArgentMobileConnectorOptions } from "../connectors/argentMobile"

export type StoreVersion = "chrome" | "firefox" | "edge"

export interface ConnectOptions extends GetWalletOptions {
  argentMobileOptions?: ArgentMobileConnectorOptions
  dappName?: string
  connectors?: Connector[]
  modalMode?: "alwaysAsk" | "canAsk" | "neverAsk"
  modalTheme?: "light" | "dark" | "system"
  storeVersion?: StoreVersion | null
  webWalletUrl?: string
}

export type ModalWallet = {
  name: string
  id: string
  icon: string
  download?: string
  subtitle?: string
  title?: string
  connector: Connector
}
