import type { GetWalletOptions } from "get-starknet-core"
import type { Connector, ConnectorIcons } from "../connectors/connector"
import type { ArgentMobileConnectorOptions } from "../connectors/argentMobile"
import { ProviderInterface } from "starknet"

export type StoreVersion = "chrome" | "firefox" | "edge"

export interface ConnectOptions extends GetWalletOptions {
  argentMobileOptions?: ArgentMobileConnectorOptions
  dappName?: string
  connectors?: Connector[]
  modalMode?: "alwaysAsk" | "canAsk" | "neverAsk"
  modalTheme?: "light" | "dark" | "system"
  storeVersion?: StoreVersion | null
  webWalletUrl?: string
  provider?: ProviderInterface
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
