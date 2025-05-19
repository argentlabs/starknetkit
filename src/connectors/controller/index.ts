import type { ProviderOptions, ProviderInterface, AccountInterface } from "starknet"
import { constants } from "starknet";

import type { RequestFnCall, RpcMessage, RpcTypeToMessageMap, StarknetWindowObject } from "@starknet-io/types-js"

import Controller, { type ControllerOptions } from "@cartridge/controller";
import { Connector, type ConnectArgs, type ConnectorData } from "../connector"
import { ConnectorNotConnectedError, UserNotConnectedError } from "../../errors"

import { CONTROLLER_ICON, RPC_URLS } from "./constants";

export class ControllerConnector extends Connector {
  private controller: Controller | null;

  constructor(options: Partial<ControllerOptions> = {}) {
    super();

    // Can pass in defaultChainId = SN_SEPOLIA to connect to Sepolia testnet
    options.defaultChainId = options.defaultChainId || constants.StarknetChainId.SN_MAIN;
    options.chains = options.chains || [{ rpcUrl: RPC_URLS[options.defaultChainId as keyof typeof RPC_URLS] }];

    this.controller = this.available()
      ? new Controller(options as ControllerOptions)
      : null;
  }

  get id() { return "cartridgeController" }
  get name() { return "Cartridge Controller" }
  get icon() { return { light: CONTROLLER_ICON, dark: CONTROLLER_ICON } }

  available() {
    return typeof window !== "undefined";
  }

  async ready() {
    if (!this.controller) {
      return false;
    }

    const account = await this.controller.probe();
    return account !== null;
  }

  async connect(_args?: ConnectArgs): Promise<ConnectorData> {
    if (!this.controller) { throw new ConnectorNotConnectedError(); }

    const account = await this.controller.connect();

    if (!account) { throw new UserNotConnectedError(); }

    return {
      account: account.address,
      chainId: BigInt(await account.getChainId())
    };
  }

  async disconnect(): Promise<void> {
    if (!this.controller) { throw new ConnectorNotConnectedError(); }

    return this.controller.disconnect();
  }

  async account(_provider: ProviderOptions | ProviderInterface): Promise<AccountInterface> {
    if (!this.controller) { throw new ConnectorNotConnectedError(); }

    const account = await this.controller.probe();

    if (!account) { throw new UserNotConnectedError(); }

    return account;
  }

  async chainId(): Promise<bigint> {
    if (!this.controller) { throw new ConnectorNotConnectedError(); }

    const account = await this.controller.probe();

    if (!account) { throw new UserNotConnectedError(); }

    return BigInt(await account.getChainId());
  }

  async request<T extends RpcMessage["type"]>(call: RequestFnCall<T>): Promise<RpcTypeToMessageMap[T]["result"]> {
    if (!this.controller) { throw new ConnectorNotConnectedError(); }

    return this.controller.request(call);
  }

  get wallet(): StarknetWindowObject {
    if (!this.controller) { throw new ConnectorNotConnectedError(); }

    return this.controller;
  }
}
