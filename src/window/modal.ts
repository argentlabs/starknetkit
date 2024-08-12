import type { GetWalletOptions } from "@starknet-io/get-starknet-core"
import { StarknetWindowObject } from "@starknet-io/types-js"
import type { ArgentMobileConnectorOptions } from "../connectors/argentMobile"
import type {
  ConnectorData,
  ConnectorIcons,
  StarknetkitConnector,
} from "../connectors/connector"

export type StoreVersion = "chrome" | "firefox" | "edge"

export interface ConnectOptions extends GetWalletOptions {
  argentMobileOptions: ArgentMobileConnectorOptions
  dappName?: string
  connectors?: StarknetkitConnector[]
  modalMode?: "alwaysAsk" | "canAsk" | "neverAsk"
  modalTheme?: "light" | "dark" | "system"
  storeVersion?: StoreVersion | null
  webWalletUrl?: string
  resultType?: "connector" | "wallet"
}

export type ModalWallet = {
  name: string
  id: string
  icon: ConnectorIcons
  download?: string
  subtitle?: string
  title?: string
  connector: StarknetkitConnector
}

export type ModalResult = {
  connector: StarknetkitConnector | null
  connectorData: ConnectorData | null
  wallet?: StarknetWindowObject | null
}
