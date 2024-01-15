import type {
  AccountChangeEventHandler,
  StarknetWindowObject,
} from "get-starknet-core"
import type { AccountInterface, ProviderInterface } from "starknet"
import {
  Connector,
  type ConnectorData,
  type ConnectorIcons,
} from "../connector"
import { setPopupOptions, trpcProxyClient } from "./helpers/trpc"

import {
  ConnectorNotConnectedError,
  ConnectorNotFoundError,
  UserNotConnectedError,
  UserRejectedRequestError,
} from "../../errors"
import { DEFAULT_WEBWALLET_ICON, DEFAULT_WEBWALLET_URL } from "./constants"
import { getWebWalletStarknetObject } from "./starknetWindowObject/getWebWalletStarknetObject"
import { removeStarknetLastConnectedWallet } from "../../helpers/lastConnected"

let _wallet: StarknetWindowObject | null = null

interface WebWalletConnectorOptions {
  url?: string
  provider?: ProviderInterface
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
    return this._wallet.isPreauthorized()
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
      await this._wallet.enable({ starknetVersion: "v4" })
    } catch {
      // NOTE: Argent v3.0.0 swallows the `.enable` call on reject, so this won't get hit.
      throw new UserRejectedRequestError()
    }

    if (!this._wallet.isConnected) {
      throw new UserRejectedRequestError()
    }

    const account = this._wallet.account as unknown as AccountInterface

    const chainId = await this.chainId()

    return {
      account: account.address,
      chainId,
    }
  }

  async disconnect(): Promise<void> {
    if (!this.available() && !this._wallet) {
      throw new ConnectorNotFoundError()
    }

    if (!this._wallet?.isConnected) {
      throw new UserNotConnectedError()
    }
    _wallet = null
    this._wallet = _wallet
    removeStarknetLastConnectedWallet()
  }

  async account(): Promise<AccountInterface> {
    this._wallet = _wallet

    if (!this._wallet || !this._wallet.account) {
      throw new ConnectorNotConnectedError()
    }

    return this._wallet.account as unknown as AccountInterface
  }

  async chainId(): Promise<bigint> {
    if (!this._wallet || !this.wallet.account || !this._wallet.provider) {
      throw new ConnectorNotConnectedError()
    }

    const chainIdHex = await this._wallet.provider.getChainId()
    const chainId = BigInt(chainIdHex)
    return chainId
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
    const provider = this._options.provider
    setPopupOptions({
      origin,
      location: "/interstitialLogin",
    })
    const wallet = await getWebWalletStarknetObject(
      origin,
      trpcProxyClient({}),
      provider,
    )

    _wallet = wallet ?? null
    this._wallet = _wallet
  }
}
