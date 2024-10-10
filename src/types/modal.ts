import type { GetWalletOptions } from "@starknet-io/get-starknet-core"
import { StarknetWindowObject } from "@starknet-io/types-js"
import type { ArgentMobileConnectorOptions } from "../connectors/argent/argentMobile"
import {
  ConnectorData,
  ConnectorIcons,
  StarknetkitCompoundConnector,
  StarknetkitConnector,
} from "../connectors/connector"

export type StoreVersion = "chrome" | "firefox" | "edge"

export interface ConnectOptions extends GetWalletOptions {
  dappName?: string
  modalMode?: "alwaysAsk" | "canAsk" | "neverAsk"
  modalTheme?: "light" | "dark" | "system"
  storeVersion?: StoreVersion | null
  resultType?: "connector" | "wallet"
  webWalletUrl?: string
  argentMobileOptions: ArgentMobileConnectorOptions
}

export interface ConnectOptionsWithConnectors
  extends Omit<ConnectOptions, "webWalletUrl" | "argentMobileOptions"> {
  connectors?: StarknetkitConnector[]
}

export type ModalWallet = {
  name: string
  id: string
  icon: ConnectorIcons
  download?: string
  subtitle?: string
  title?: string
  connector: StarknetkitConnector | StarknetkitCompoundConnector
  isCompoundConnector?: boolean
}

export type ModalResult = {
  connector: StarknetkitConnector | null
  connectorData: ConnectorData | null
  wallet?: StarknetWindowObject | null
}
