import {
  Permission,
  type AccountChangeEventHandler,
  type RequestFnCall,
  type RpcMessage,
  type RpcTypeToMessageMap,
  type StarknetWindowObject,
} from "@starknet-io/types-js"
import {
  Account,
  type AccountInterface,
  type ProviderInterface,
  type ProviderOptions,
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
  type ConnectArgs,
  type ConnectorData,
  type ConnectorIcons,
} from "../connector"
import { DEFAULT_WEBWALLET_ICON, DEFAULT_WEBWALLET_URL } from "./constants"
import { openWebwallet } from "./helpers/openWebwallet"
import { setPopupOptions } from "./helpers/trpc"
import type { WebWalletStarknetWindowObject } from "./starknetWindowObject/argentStarknetWindowObject"
import type {
  WebWalletConnectorOptions,
  WebwalletGoogleAuthOptions,
} from "./types"

let _wallet: StarknetWindowObject | null = null
let _address: string | null = null

export class WebWalletConnector extends Connector {
  protected _wallet: StarknetWindowObject | null = null
  protected _options: WebWalletConnectorOptions

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
      _address = null
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

  async connect(_args: ConnectArgs = {}): Promise<ConnectorData> {
    await this.ensureWallet()

    if (!this._wallet) {
      throw new ConnectorNotFoundError()
    }

    try {
      let account, chainId

      if (this._options.ssoToken) {
        const ssoReponse = await (
          this._wallet as WebWalletStarknetWindowObject
        ).connectWebwalletSSO(
          this._options.ssoToken,
          this._options.authorizedPartyId,
        )
        account = ssoReponse.account
        chainId = ssoReponse.chainId
      } else {
        const connectResponse = await (
          this._wallet as WebWalletStarknetWindowObject
        ).connectWebwallet({ theme: this._options.theme })
        account = connectResponse.account
        chainId = connectResponse.chainId
      }

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
    _address = null
    this._wallet = null
  }

  protected async ensureWallet(): Promise<void> {
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

export class WebwalletGoogleAuthConnector extends WebWalletConnector {
  private _clientId: string

  constructor(
    options: WebwalletGoogleAuthOptions = {
      clientId: "",
      authorizedPartyId: "",
    },
  ) {
    if (!options.clientId || !options.authorizedPartyId) {
      throw new Error("clientId and authorizedPartyId are required")
    }

    super(options)
    this._clientId = options.clientId
  }

  get id(): string {
    this._wallet = _wallet
    return this._wallet?.id || "argentWebWalletGoogleAuth"
  }

  get title(): string {
    return "Google"
  }

  get clientId(): string {
    return this._clientId
  }

  public setSSOToken(response: { credential: string | null }) {
    if (response.credential) {
      // Send the token to your server for verification
      this._options.ssoToken = response.credential
    } else {
      throw new Error("No credential received")
    }
  }
}
