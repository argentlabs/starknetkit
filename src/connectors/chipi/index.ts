import type {
  RequestFnCall,
  RpcMessage,
  RpcTypeToMessageMap,
  StarknetWindowObject,
} from "@starknet-io/types-js"
import {
  WalletAccount,
  type AccountInterface,
  type ProviderInterface,
  type ProviderOptions,
} from "starknet"
import { ChipiPopupTransport, registerChipiWallet } from "@chipi-stack/starknet-connector"
import {
  ConnectorNotAvailableError,
  ConnectorNotConnectedError,
  UserRejectedRequestError,
} from "../../errors"
import {
  StarknetkitConnector,
  type ConnectArgs,
  type ConnectorData,
  type ConnectorIcons,
} from "../connector"
import { CHIPI_ICON } from "./constants"

/** Starknet mainnet chain id (felt of the shortstring "SN_MAIN"). */
const SN_MAIN = BigInt("0x534e5f4d41494e")
const DEFAULT_WALLET_URL = "https://wallet.chipipay.com"

export interface ChipiConnectorOptions {
  /** Hosted wallet base URL. Defaults to `https://wallet.chipipay.com`. */
  walletUrl?: string
}

/**
 * "Connect with Chipi" connector for Starknetkit.
 *
 * Chipi is a hosted smart-account wallet (passkey, gasless via paymaster). The
 * connector opens the hosted wallet in a popup and forwards get-starknet
 * `wallet_*` RPC over postMessage; it holds no keys. This is the same hosted
 * model as the Ready and Cartridge connectors. It wraps the published
 * `@chipi-stack/starknet-connector` transport.
 */
export class ChipiConnector extends StarknetkitConnector {
  private _transport: ChipiPopupTransport
  private _wallet: StarknetWindowObject | null = null
  private _address: string | null = null

  constructor(options: ChipiConnectorOptions = {}) {
    super()
    this._transport = new ChipiPopupTransport({
      walletUrl: options.walletUrl ?? DEFAULT_WALLET_URL,
      mode: "popup",
    })
    // Self-register on window so get-starknet's getAvailableWallets discovers
    // the wallet. Starknetkit's modal marks a connector "installed" only when its
    // id is found among the scanned wallets; without this it routes a hosted
    // wallet to the "download" screen. Same approach as Cartridge Controller.
    registerChipiWallet(this.buildWallet())
  }

  get id(): string {
    return "chipi"
  }

  get name(): string {
    return "Connect with Chipi"
  }

  get icon(): ConnectorIcons {
    return { light: CHIPI_ICON, dark: CHIPI_ICON }
  }

  get wallet(): StarknetWindowObject {
    if (!this._wallet) {
      throw new ConnectorNotConnectedError()
    }
    return this._wallet
  }

  available(): boolean {
    return typeof window !== "undefined"
  }

  async ready(): Promise<boolean> {
    return this._address !== null
  }

  /** Build the postMessage-backed get-starknet window object over the transport. */
  private buildWallet(): StarknetWindowObject {
    if (this._wallet) {
      return this._wallet
    }
    const transport = this._transport
    this._wallet = {
      id: this.id,
      name: this.name,
      version: "1.0.0",
      icon: CHIPI_ICON,
      request: ((call: RpcMessage) =>
        transport.request(call)) as StarknetWindowObject["request"],
      on: ((event: string, handler: (data: unknown) => void) => {
        if (event === "accountsChanged" || event === "networkChanged") {
          transport.on(event, handler)
        }
      }) as StarknetWindowObject["on"],
      off: ((event: string, handler: (data: unknown) => void) => {
        if (event === "accountsChanged" || event === "networkChanged") {
          transport.off(event, handler)
        }
      }) as StarknetWindowObject["off"],
    }
    return this._wallet
  }

  async connect(_args: ConnectArgs = {}): Promise<ConnectorData> {
    if (!this.available()) {
      throw new ConnectorNotAvailableError()
    }
    await this._transport.open()
    this.buildWallet()
    const accounts = (await this._transport.request({
      type: "wallet_requestAccounts",
    })) as string[]
    const account = accounts?.[0]
    if (!account) {
      throw new UserRejectedRequestError()
    }
    this._address = account
    const chainId = SN_MAIN

    /**
     * @dev This emit ensures compatibility with starknet-react
     */
    this.emit("connect", { account, chainId })

    return { account, chainId }
  }

  async disconnect(): Promise<void> {
    this._transport.close()
    this._wallet = null
    this._address = null

    /**
     * @dev This emit ensures compatibility with starknet-react
     */
    this.emit("disconnect")
  }

  async account(
    provider: ProviderOptions | ProviderInterface,
  ): Promise<AccountInterface> {
    if (!this._wallet || !this._address) {
      throw new ConnectorNotConnectedError()
    }
    return new WalletAccount({
      provider,
      walletProvider: this._wallet,
      address: this._address,
    })
  }

  async chainId(): Promise<bigint> {
    return SN_MAIN
  }

  async request<T extends RpcMessage["type"]>(
    call: RequestFnCall<T>,
  ): Promise<RpcTypeToMessageMap[T]["result"]> {
    return this._transport.request(call) as Promise<
      RpcTypeToMessageMap[T]["result"]
    >
  }
}
