import { type AccountChangeEventHandler } from "@starknet-io/get-starknet-core"
import type {
  RequestFnCall,
  RpcMessage,
  RpcTypeToMessageMap,
  StarknetWindowObject,
} from "@starknet-io/types-js"
import type {
  AccountInterface,
  ProviderInterface,
  ProviderOptions,
} from "starknet"
import {
  Connector,
  type ConnectArgs,
  type ConnectorData,
  type ConnectorIcons,
} from "../connector"
import { Keplr } from "../injected/keplr"
import { type InjectedConnectorOptions } from "../injected"
import { KEPLR_MOBILE_APP_ICON } from "./constants"
import { isInKeplrMobileAppBrowser } from "./helpers/inAppBrowser"

export class KeplrMobileBaseConnector extends Connector {
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
    return "keplrMobile"
  }

  get name(): string {
    return "Keplr (mobile)"
  }

  get icon(): ConnectorIcons {
    return {
      dark: KEPLR_MOBILE_APP_ICON,
      light: KEPLR_MOBILE_APP_ICON,
    }
  }

  get wallet(): StarknetWindowObject {
    throw new Error("not implemented")
  }

  async connect(_args: ConnectArgs = {}): Promise<ConnectorData> {
    await this.ensureWallet()

    // will return empty data, connect will only open keplr mobile app
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
    window.open(
      `https://deeplink.keplr.app/web-browser?url=${encodeURIComponent(window.origin)}`,
      "_blank",
    )
  }
}

export interface KeplrMobileConnectorInitParams {
  inAppBrowserOptions?: Omit<InjectedConnectorOptions, "id">
}

export class KeplrMobileConnector {
  static init(params?: KeplrMobileConnectorInitParams): Connector {
    const { inAppBrowserOptions } = params || {}
    if (isInKeplrMobileAppBrowser()) {
      return new Keplr(inAppBrowserOptions)
    } else {
      return new KeplrMobileBaseConnector()
    }
  }
}

export { isInKeplrMobileAppBrowser }
