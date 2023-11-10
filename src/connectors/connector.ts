import EventEmitter from "eventemitter3"

import type { StarknetWindowObject } from "get-starknet-core"
import type { AccountInterface } from "starknet"

/** Connector data. */
export type ConnectorData = {
  /** Connector account. */
  account?: string
  /** Connector network. */
  chainId?: bigint
}

/** Connector icons, as base64 encoded svg. */
export type ConnectorIcons = {
  /** Dark-mode icon. */
  dark?: string
  /** Light-mode icon. */
  light?: string
}

/** Connector events. */
export interface ConnectorEvents {
  /** Emitted when account or network changes. */
  change(data: ConnectorData): void
  /** Emitted when connection is established. */
  connect(data: ConnectorData): void
  /** Emitted when connection is lost. */
  disconnect(): void
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export abstract class Connector extends EventEmitter<ConnectorEvents> {
  /** Whether connector is available for use */
  abstract available(): boolean

  /** Whether connector is already authorized */
  abstract ready?(): Promise<boolean>
  abstract connect(): Promise<AccountInterface>
  abstract disconnect(): Promise<void>
  abstract account(): Promise<AccountInterface | null>
  /** Unique connector id */
  abstract get id(): string
  /** Connector name */
  abstract get name(): string
  /** Connector icon */
  abstract get icon(): ConnectorIcons
  /**  Connector StarknetWindowObject */
  abstract get wallet(): StarknetWindowObject
}
