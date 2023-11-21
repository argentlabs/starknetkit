import type { GetWalletOptions } from "get-starknet-core"
import type { Connector, ConnectorIcons } from "../connectors/connector"
import type { ArgentMobileConnectorOptions } from "../connectors/argentMobile"

export type StoreVersion = "chrome" | "firefox" | "edge"

export type ModalMode = "alwaysAsk" | "canAsk" | "neverAsk"

export type ModalTheme = "light" | "dark" | "system"

export interface ConnectOptions extends GetWalletOptions {
  argentMobileOptions?: ArgentMobileConnectorOptions
  dappName?: string
  connectors?: Connector[]
  modalMode?: ModalMode
  modalTheme?: ModalTheme
  storeVersion?: StoreVersion | null
  webWalletUrl?: string
}

export type ModalWallet = {
  name: string
  id: string
  icon: ConnectorIcons
  download?: string
  subtitle?: string
  title?: string
  connector: Connector
}
