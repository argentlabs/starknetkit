import type { ProviderOptions, ProviderInterface, AccountInterface } from "starknet"
import { constants } from "starknet";

import type { RequestFnCall, RpcMessage, RpcTypeToMessageMap, StarknetWindowObject } from "@starknet-io/types-js"

import Controller, { type ControllerOptions } from "@cartridge/controller";
import { Connector, type ConnectArgs, type ConnectorData } from "../connector"
import { ConnectorNotConnectedError } from "../../errors"

import { CONTROLLER_ICON, RPC_URLS } from "./constants";

export class ControllerConnector extends Connector {
  private controller: Controller;

  static init(options: Partial<ControllerOptions>): ControllerConnector | null {
    if (typeof window === "undefined") {
      return null;
    }

    options = options || {};
    options.defaultChainId = options.defaultChainId || constants.StarknetChainId.SN_MAIN;
    options.chains = options.chains || [{ rpcUrl: RPC_URLS[options.defaultChainId as keyof typeof RPC_URLS] }];

    return new ControllerConnector(options as ControllerOptions);
  }

  constructor(options: ControllerOptions) {
    super();
    this.controller = new Controller(options);
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
    const account = await this.controller.connect();

    if (!account) {
      throw new ConnectorNotConnectedError();
    }

    return {
      account: account.address,
      chainId: BigInt(await account.getChainId())
    };
  }

  async disconnect(): Promise<void> {
    return this.controller.disconnect();
  }

  async account(_provider: ProviderOptions | ProviderInterface): Promise<AccountInterface> {
    const account = await this.controller.probe();

    if (!account) {
      throw new ConnectorNotConnectedError();
    }

    return account;
  }

  async chainId(): Promise<bigint> {
    const account = await this.controller.probe();

    if (!account) {
      throw new ConnectorNotConnectedError();
    }

    return BigInt(await account.getChainId());
  }

  async request<T extends RpcMessage["type"]>(call: RequestFnCall<T>): Promise<RpcTypeToMessageMap[T]["result"]> {
    return this.controller.request(call);
  }

  get wallet(): StarknetWindowObject {
    return this.controller;
  }
}
