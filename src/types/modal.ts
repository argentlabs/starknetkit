import type { GetWalletOptions } from "@starknet-io/get-starknet-core"
import { StarknetWindowObject } from "@starknet-io/types-js"
import type { ArgentMobileConnectorOptions } from "../connectors/argent/argentMobile"
import {
  ConnectorData,
  ConnectorIcons,
  StarknetkitCompoundConnector,
  StarknetkitConnector,
} from "../connectors"

export type StoreVersion = "chrome" | "firefox" | "edge"

export type Theme = "dark" | "light" | null

export enum Layout {
  walletList = "walletList",
  connecting = "connecting",
  success = "success",
  failure = "failure",
  qrCode = "qrCode",
  download = "download",
}

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
  connectors?: (StarknetkitConnector | StarknetkitCompoundConnector)[]
}

export type ModalWallet = {
  name: string
  id: string
  icon: ConnectorIcons
  installed: boolean
  download?: string
  downloads?: Record<string, string>
  subtitle?: string
  title?: string
  connector: StarknetkitConnector | StarknetkitCompoundConnector
}

export type Callback = (
  value: ModalWallet | null,
  useFallback?: boolean,
) => Promise<void>

export type ModalResult = {
  connector: StarknetkitConnector | null
  connectorData: ConnectorData | null
  wallet?: StarknetWindowObject | null
}
