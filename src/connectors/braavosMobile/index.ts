import { type AccountChangeEventHandler } from "@starknet-io/get-starknet-core"
import type {
  RequestFnCall,
  RpcMessage,
  RpcTypeToMessageMap,
  StarknetWindowObject,
} from "@starknet-io/types-js"
import {
  AccountInterface,
  ProviderInterface,
  type ProviderOptions,
} from "starknet"
import {
  Connector,
  type ConnectArgs,
  type ConnectorData,
  type ConnectorIcons,
} from "../connector"
import { Braavos } from "../injected/braavos"
import { type InjectedConnectorOptions } from "../injected"
import { BRAAVOS_MOBILE_APP_ICON } from "./constants"
import { isInBraavosMobileAppBrowser } from "./helpers/inAppBrowser"

export class BraavosMobileBaseConnector extends Connector {
  private _wallet: StarknetWindowObject | null = null

  constructor() {
    super()
  }

  available(): boolean {
    return true
  }

  async ready(): Promise<boolean> {
    // return true to be compatible with starknet-react
    // will need to be implemented
    return true
  }

  get id(): string {
    return "braavosMobile"
  }

  get name(): string {
    return "Braavos (mobile)"
  }

  get icon(): ConnectorIcons {
    return {
      dark: BRAAVOS_MOBILE_APP_ICON,
      light: BRAAVOS_MOBILE_APP_ICON,
    }
  }

  get wallet(): StarknetWindowObject {
    throw new Error("not implemented")
  }

  async connect(_args: ConnectArgs = {}): Promise<ConnectorData> {
    await this.ensureWallet()

    // will return empty data, connect will only open braavos mobile app
    // will require to implement the wallet connection
    return {
      account: "",
      chainId: BigInt(0),
    }
  }

  async disconnect(): Promise<void> {
    throw new Error("not implemented")
  }

  async account(
    _: ProviderOptions | ProviderInterface,
  ): Promise<AccountInterface> {
    throw new Error("not implemented")
  }

  async chainId(): Promise<bigint> {
    throw new Error("not implemented")
  }

  async request<T extends RpcMessage["type"]>(
    call: RequestFnCall<T>,
  ): Promise<RpcTypeToMessageMap[T]["result"]> {
    throw new Error("not implemented")
  }

  // needed, methods required by starknet-react. Otherwise an exception is throwd
  async initEventListener(_: AccountChangeEventHandler) {
    throw new Error("not implemented")
  }

  // needed, methods required by starknet-react. Otherwise an exception is throwd
  async removeEventListener(_: AccountChangeEventHandler) {
    throw new Error("not implemented")
  }

  private async ensureWallet(): Promise<void> {
    window.open(`https://link.braavos.app/dapp/${window.origin}`, "_blank")
  }
}

export interface BraavosMobileConnectorInitParams {
  inAppBrowserOptions?: Omit<InjectedConnectorOptions, "id">
}

export class BraavosMobileConnector {
  static init(params?: BraavosMobileConnectorInitParams): Connector {
    const { inAppBrowserOptions } = params || {}
    if (isInBraavosMobileAppBrowser()) {
      return new Braavos(inAppBrowserOptions)
    } else {
      return new BraavosMobileBaseConnector()
    }
  }
}

export { isInBraavosMobileAppBrowser }
