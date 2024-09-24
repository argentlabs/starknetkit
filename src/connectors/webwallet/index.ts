import {
  Permission,
  RequestFnCall,
  RpcMessage,
  RpcTypeToMessageMap,
  type AccountChangeEventHandler,
  type StarknetWindowObject,
} from "@starknet-io/types-js"
import {
  Account,
  AccountInterface,
  ProviderInterface,
  ProviderOptions,
} from "starknet"
import {
  ConnectorNotConnectedError,
  ConnectorNotFoundError,
  UserRejectedRequestError,
} from "../../errors"
import { getStarknetChainId } from "../../helpers/getStarknetChainId"
import { removeStarknetLastConnectedWallet } from "../../helpers/lastConnected"
import {
  Connector,
  type ConnectorData,
  type ConnectorIcons,
} from "../connector"
import { DEFAULT_WEBWALLET_ICON, DEFAULT_WEBWALLET_URL } from "./constants"
import { openWebwallet } from "./helpers/openWebwallet"
import { setPopupOptions } from "./helpers/trpc"
import type { WebWalletStarknetWindowObject } from "./starknetWindowObject/argentStarknetWindowObject"

let _wallet: StarknetWindowObject | null = null
let _address: string | null = null

interface WebWalletConnectorOptions {
  url?: string
}

export class WebWalletConnector extends Connector {
  private _wallet: StarknetWindowObject | null = null
  private _options: WebWalletConnectorOptions

  constructor(options: WebWalletConnectorOptions = {}) {
    super()
    this._options = options
  }

  available(): boolean {
    return true
  }

  async ready(): Promise<boolean> {
    if (!_wallet) {
      this._wallet = null
      return false
    }

    this._wallet = _wallet
    try {
      const permissions = await this._wallet.request({
        type: "wallet_getPermissions",
      })

      return (permissions as Permission[]).includes(Permission.ACCOUNTS)
    } catch {
      return false
    }
  }

  get id(): string {
    this._wallet = _wallet
    return this._wallet?.id || "argentWebWallet"
  }

  get name(): string {
    this._wallet = _wallet
    return this._wallet?.name || "Argent Web Wallet"
  }

  get icon(): ConnectorIcons {
    return {
      light: DEFAULT_WEBWALLET_ICON,
      dark: DEFAULT_WEBWALLET_ICON,
    }
  }

  get wallet(): StarknetWindowObject {
    if (!this._wallet) {
      throw new ConnectorNotConnectedError()
    }
    return this._wallet
  }

  get title(): string {
    return "Email"
  }

  get subtitle(): string {
    return "Powered by Argent"
  }

  async connect(): Promise<ConnectorData> {
    await this.ensureWallet()

    if (!this._wallet) {
      throw new ConnectorNotFoundError()
    }

    try {
      const { account, chainId } = await (
        this._wallet as WebWalletStarknetWindowObject
      ).connectWebwallet()

      if (!account || !chainId) {
        return {}
      }

      const hexChainId = getStarknetChainId(chainId)

      _address = account[0]

      return {
        account: account[0],
        chainId: BigInt(hexChainId),
      }
    } catch {
      throw new UserRejectedRequestError()
    }
  }

  async request<T extends RpcMessage["type"]>(
    call: RequestFnCall<T>,
  ): Promise<RpcTypeToMessageMap[T]["result"]> {
    if (!this._wallet) {
      throw new ConnectorNotConnectedError()
    }
    try {
      return await this._wallet.request(call)
    } catch (e) {
      console.error(e)
      throw new UserRejectedRequestError()
    }
  }

  async disconnect(): Promise<void> {
    if (!this.available() && !this._wallet) {
      throw new ConnectorNotFoundError()
    }

    _wallet = null
    _address = null
    this._wallet = _wallet
    removeStarknetLastConnectedWallet()
  }

  async account(
    provider: ProviderOptions | ProviderInterface,
  ): Promise<AccountInterface> {
    this._wallet = _wallet

    if (!this._wallet) {
      throw new ConnectorNotConnectedError()
    }

    if (!_address) {
      throw new ConnectorNotConnectedError()
    }

    return new Account(provider, _address, "")
  }

  async chainId(): Promise<bigint> {
    if (!this._wallet) {
      throw new ConnectorNotConnectedError()
    }

    const chainId = await this._wallet.request({
      type: "wallet_requestChainId",
    })

    const hexChainId = getStarknetChainId(chainId)
    return BigInt(hexChainId)
  }

  async initEventListener(accountChangeCb: AccountChangeEventHandler) {
    this._wallet = _wallet
    if (!this._wallet) {
      throw new ConnectorNotConnectedError()
    }

    this._wallet.on("accountsChanged", accountChangeCb)
  }

  async removeEventListener(accountChangeCb: AccountChangeEventHandler) {
    this._wallet = _wallet
    if (!this._wallet) {
      throw new ConnectorNotConnectedError()
    }

    this._wallet.off("accountsChanged", accountChangeCb)

    _wallet = null
    this._wallet = null
  }

  private async ensureWallet(): Promise<void> {
    const origin = this._options.url || DEFAULT_WEBWALLET_URL
    setPopupOptions({
      origin,
      location: "/interstitialLogin",
    })

    _wallet = (await openWebwallet(origin)) ?? null

    this._wallet = _wallet
  }
}

export type { WebWalletStarknetWindowObject }
