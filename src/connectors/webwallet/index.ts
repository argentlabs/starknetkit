import {
  type StarknetWindowObject,
  type AccountChangeEventHandler,
  Permission,
} from "get-starknet-core"
import {
  Connector,
  type ConnectorData,
  type ConnectorIcons,
} from "../connector"
import { setPopupOptions, trpcProxyClient } from "./helpers/trpc"

import {
  ConnectorNotConnectedError,
  ConnectorNotFoundError,
  UserRejectedRequestError,
} from "../../errors"
import { DEFAULT_WEBWALLET_ICON, DEFAULT_WEBWALLET_URL } from "./constants"
import { getWebWalletStarknetObject } from "./starknetWindowObject/getWebWalletStarknetObject"
import { removeStarknetLastConnectedWallet } from "../../helpers/lastConnected"

let _wallet: StarknetWindowObject | null = null

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
    const permissions = await this._wallet.request({
      type: "wallet_getPermissions",
    })

    return permissions.includes(Permission.Accounts)
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

    let accounts: string[]

    try {
      accounts = await this._wallet.request({ type: "wallet_requestAccounts" })
    } catch {
      throw new UserRejectedRequestError()
    }

    const chainId = await this.chainId()

    return {
      account: accounts[0],
      chainId,
    }
  }

  async disconnect(): Promise<void> {
    if (!this.available() && !this._wallet) {
      throw new ConnectorNotFoundError()
    }

    _wallet = null
    this._wallet = _wallet
    removeStarknetLastConnectedWallet()
  }

  async account(): Promise<string | null> {
    this._wallet = _wallet

    if (!this._wallet) {
      throw new ConnectorNotConnectedError()
    }

    const [account] = await this._wallet.request({
      type: "wallet_requestAccounts",
      params: { silentMode: true },
    })

    return account ?? null
  }

  async chainId(): Promise<bigint> {
    if (!this._wallet) {
      throw new ConnectorNotConnectedError()
    }

    const chainIdHex = await this._wallet.request({
      type: "wallet_requestChainId",
    })
    return BigInt(chainIdHex)
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
    const wallet = await getWebWalletStarknetObject(origin, trpcProxyClient({}))

    _wallet = wallet ?? null
    this._wallet = _wallet
  }
}
