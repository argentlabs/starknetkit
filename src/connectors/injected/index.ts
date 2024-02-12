import {
  Permission,
  StarknetChainId,
  StarknetWindowObject,
} from "get-starknet-core"
import { constants } from "starknet"
import {
  ConnectorNotConnectedError,
  ConnectorNotFoundError,
  UserRejectedRequestError,
} from "../../errors"
import { removeStarknetLastConnectedWallet } from "../../helpers/lastConnected"
import {
  Connector,
  type ConnectorData,
  type ConnectorIcons,
} from "../connector"
import {
  WALLET_NOT_FOUND_ICON_DARK,
  WALLET_NOT_FOUND_ICON_LIGHT,
} from "./constants"
import { isString } from "lodash-es"
/** Injected connector options. */
export interface InjectedConnectorOptions {
  /** The wallet id. */
  id: string
  /** Wallet human readable name. */
  name?: string
  /** Wallet icons. */
  icon?: ConnectorIcons
}

export class InjectedConnector extends Connector {
  private _wallet?: StarknetWindowObject
  private _options: InjectedConnectorOptions

  constructor({ options }: { options: InjectedConnectorOptions }) {
    super()
    this._options = options
  }

  available(): boolean {
    // This should be awaited ideally but it would break compatibility with
    // starknet-react. Do we need to make this async? Is ensureWallet needed?
    this.ensureWallet()
    return this._wallet !== undefined
  }

  async ready(): Promise<boolean> {
    this.ensureWallet()

    if (!this._wallet) {
      return false
    }

    const permissions = await this._wallet.request({
      type: "wallet_getPermissions",
    })

    return permissions.includes(Permission.Accounts)
  }

  async chainId(): Promise<StarknetChainId> {
    this.ensureWallet()

    if (!this._wallet) {
      throw new ConnectorNotConnectedError()
    }

    return this._wallet.request({
      type: "wallet_requestChainId",
    })
  }

  private async onAccountsChanged(accounts?: string[]): Promise<void> {
    if (!accounts) {
      return void this.emit("disconnect")
    }
    const account = accounts[0]
    const chainId = await this.chainId()
    this.emit("change", { account, chainId })
  }

  private onNetworkChanged(
    chainId?: StarknetChainId,
    accounts?: string[],
  ): void {
    const { SN_GOERLI, SN_MAIN } = constants.StarknetChainId
    const account = accounts?.[0]
    switch (chainId) {
      // TODO: add sepolia
      case SN_MAIN:
      case SN_GOERLI:
        this.emit("change", { chainId, account })
        break
      default:
        this.emit("change", {})
        break
    }
  }

  async connect(): Promise<ConnectorData> {
    this.ensureWallet()

    if (!this._wallet) {
      throw new ConnectorNotFoundError()
    }

    let accounts: string[] | null
    try {
      accounts = await this._wallet.request({
        type: "wallet_requestAccounts",
        params: { silentMode: false }, // explicit to show the modal
      })
    } catch {
      // NOTE: Argent v3.0.0 swallows the `.enable` call on reject, so this won't get hit.
      throw new UserRejectedRequestError()
    }

    if (!accounts) {
      // NOTE: Argent v3.0.0 swallows the `.enable` call on reject, so this won't get hit.
      throw new UserRejectedRequestError()
    }

    this._wallet.on("accountsChanged", this.onAccountsChanged.bind(this))

    this._wallet.on("networkChanged", this.onNetworkChanged.bind(this))

    await this.onAccountsChanged(accounts)

    const account = accounts[0]
    const chainId = await this.chainId()

    this.emit("connect", { account, chainId })

    return {
      account,
      chainId,
    }
  }

  async disconnect(): Promise<void> {
    this.ensureWallet()
    removeStarknetLastConnectedWallet()
    if (!this.available()) {
      throw new ConnectorNotFoundError()
    }
  }

  async account(): Promise<string> {
    this.ensureWallet()

    if (!this._wallet) {
      throw new ConnectorNotConnectedError()
    }

    return this._wallet
      .request({
        type: "wallet_requestAccounts",
        params: { silentMode: true },
      })
      .then((accounts) => accounts[0])
  }

  get id(): string {
    return this._options.id
  }

  get name(): string {
    if (!this._wallet) {
      throw new ConnectorNotConnectedError()
    }
    return this._wallet.name
  }

  get icon(): ConnectorIcons {
    const defaultIcons = {
      dark: WALLET_NOT_FOUND_ICON_DARK,
      light: WALLET_NOT_FOUND_ICON_LIGHT,
    }

    if (this._options.icon) {
      return this._options.icon
    }

    const walletIcon = this._wallet?.icon
    if (walletIcon) {
      const darkIcon = isString(walletIcon) ? walletIcon : walletIcon.dark
      const lightIcon = isString(walletIcon) ? walletIcon : walletIcon.light

      return { dark: darkIcon, light: lightIcon }
    }

    return defaultIcons
  }

  get wallet(): StarknetWindowObject {
    if (!this._wallet) {
      throw new ConnectorNotConnectedError()
    }
    return this._wallet
  }

  private ensureWallet() {
    const installed = getAvailableWallets(globalThis)
    const wallet = installed.filter((w) => w.id === this._options.id)[0]
    if (wallet) {
      this._wallet = wallet
    }
  }
}

function getAvailableWallets(obj: Record<string, any>): StarknetWindowObject[] {
  return Object.values(
    Object.getOwnPropertyNames(obj).reduce<
      Record<string, StarknetWindowObject>
    >((wallets, key) => {
      if (key.startsWith("starknet")) {
        const wallet = obj[key]

        if (isWalletObject(wallet) && !wallets[wallet.id]) {
          wallets[wallet.id] = wallet as StarknetWindowObject
        }
      }
      return wallets
    }, {}),
  )
}

// biome-ignore lint: wallet could be anything
function isWalletObject(wallet: any): boolean {
  try {
    return (
      wallet &&
      [
        // wallet's must have methods/members, see StarknetWindowObject
        "request",
        "on",
        "off",
        "version",
        "id",
        "name",
        "icon",
      ].every((key) => key in wallet)
    )
  } catch (err) {
    /* empty */
  }
  return false
}
