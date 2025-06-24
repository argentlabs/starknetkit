import EventEmitter from "eventemitter3"
import {
  AccountInterface,
  ProviderInterface,
  type ProviderOptions,
} from "starknet"
import type {
  RequestFnCall,
  RpcMessage,
  RpcTypeToMessageMap,
  StarknetWindowObject,
} from "@starknet-io/types-js"

/** Connector icons, as base64 encoded svg. */
export type ConnectorIcons = StarknetWindowObject["icon"]

/** Connector data. */
export type ConnectorData = {
  /** Connector account. */
  account?: string
  /** Connector network. */
  chainId?: bigint
}

/** Connector events. */
export interface BaseConnectorEvents {
  /** Emitted when account or network changes. */
  change(data: ConnectorData): void
  /** Emitted when connection is established. */
  connect(data: ConnectorData): void
  /** Emitted when connection is lost. */
  disconnect(): void
}

interface ConnectorEvents extends BaseConnectorEvents {
  /** Emitted when `shouldEmit` is true, used for StarknetReactWrapper */
  connectionStatus?(s: "init" | "success" | "fail" | "fallback"): void
}

export type ConnectArgs = {
  chainIdHint?: bigint
  onlyQRCode?: boolean
}

export abstract class Connector extends EventEmitter<ConnectorEvents> {
  /** Unique connector id. */
  abstract get id(): string
  /** Connector name. */
  abstract get name(): string
  /** Connector icons. */
  abstract get icon(): ConnectorIcons

  /** Whether connector is available for use */
  abstract available(): boolean
  /** Whether connector is already authorized */
  abstract ready(): Promise<boolean>
  /** Connect wallet. */
  abstract connect(params?: ConnectArgs): Promise<ConnectorData>
  /** Disconnect wallet. */
  abstract disconnect(): Promise<void>
  /** Get current account silently. Return null if the account is not authorized */
  abstract account(
    provider: ProviderOptions | ProviderInterface,
  ): Promise<AccountInterface>
  /** Get current chain id. */
  abstract chainId(): Promise<bigint>
  /** Create request call to wallet */
  abstract request<T extends RpcMessage["type"]>(
    call: RequestFnCall<T>,
  ): Promise<RpcTypeToMessageMap[T]["result"]>
  /** Handle starknet-react type compatibility */
  eventNames(): (keyof BaseConnectorEvents)[] {
    return ["change", "connect", "disconnect"]
  }
}

export abstract class StarknetkitConnector extends Connector {
  /**  Connector StarknetWindowObject */
  abstract get wallet(): StarknetWindowObject
}

export abstract class StarknetkitCompoundConnector {
  readonly isCompoundConnector = true
  abstract connector: StarknetkitConnector
  abstract fallbackConnector: StarknetkitConnector | null
  abstract get name(): string
  abstract get icon(): ConnectorIcons
}
