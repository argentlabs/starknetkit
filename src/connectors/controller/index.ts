import type { ProviderOptions, ProviderInterface, AccountInterface } from "starknet"

import type {
  RequestFnCall,
  RpcMessage,
  RpcTypeToMessageMap,
  StarknetWindowObject,
  TypedData,
} from "@starknet-io/types-js"

import Controller, { type ControllerOptions } from "@cartridge/controller"
import { Connector, type ConnectArgs, type ConnectorData } from "../connector"

import {
  ConnectorNotConnectedError,
  UserNotConnectedError,
  UserRejectedRequestError,
} from "../../errors"

import { CONTROLLER_ICON } from "./constants"

export class ControllerConnector extends Connector {
  private controller: Controller | null

  constructor(options: Partial<ControllerOptions> = {}) {
    super()

    this.controller = this.available()
      ? new Controller(options as ControllerOptions)
      : null
  }

  get id() {
    return "controller"
  }
  get name() {
    return "Cartridge Controller"
  }
  get icon() {
    return { light: CONTROLLER_ICON, dark: CONTROLLER_ICON }
  }

  available() {
    return typeof window !== "undefined"
  }

  async ready() {
    return !!this.controller && this.controller.isReady()
  }

  async connect(_args?: ConnectArgs): Promise<ConnectorData> {
    if (!this.controller) {
      throw new ConnectorNotConnectedError()
    }

    const account = await this.controller.connect()

    if (!account) {
      throw new UserNotConnectedError()
    }

    const chainId = await this.chainId()

    /**
     * @dev This emit ensures compatibility with starknet-react
     */
    this.emit("connect", { account: account.address, chainId })

    return {
      account: account.address,
      chainId: chainId,
    }
  }

  async disconnect(): Promise<void> {
    if (!this.controller) {
      throw new ConnectorNotConnectedError()
    }

    /**
     * @dev This emit ensures compatibility with starknet-react
     */
    this.emit("disconnect")

    return this.controller.disconnect()
  }

  async account(
    _provider: ProviderOptions | ProviderInterface,
  ): Promise<AccountInterface> {
    if (!this.controller) {
      throw new ConnectorNotConnectedError()
    }

    const account = await this.controller.probe()

    if (!account) {
      throw new UserNotConnectedError()
    }

    return account
  }

  async chainId(): Promise<bigint> {
    if (!this.controller) {
      throw new ConnectorNotConnectedError()
    }

    const account = await this.controller.probe()

    if (!account) {
      throw new UserNotConnectedError()
    }

    return BigInt(await account.getChainId())
  }

  async request<T extends RpcMessage["type"]>(
    call: RequestFnCall<T>,
  ): Promise<RpcTypeToMessageMap[T]["result"]> {
    if (!this.controller) {
      throw new ConnectorNotConnectedError()
    }

    // Handle SNIP-12 compliance for signTypedData requests
    if (call.type === "wallet_signTypedData") {
      const params = call.params as TypedData
      if (!params.types.StarknetDomain) {
        throw new Error(
          `Controller requires a SNIP-12 version 1 domain separator. ` +
            `See: https://github.com/starknet-io/SNIPs/blob/main/SNIPS/snip-12.md#domain-separator`,
        )
      }
    }

    try {
      return await this.controller.request(call)
    } catch {
      throw new UserRejectedRequestError()
    }
  }

  get wallet(): StarknetWindowObject {
    if (!this.controller) {
      throw new ConnectorNotConnectedError()
    }

    return this.controller
  }
}
