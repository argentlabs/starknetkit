import type { StarknetWindowObject } from "get-starknet-core"
import { AccountInterface, ProviderInterface, constants } from "starknet"
import {
  ConnectorNotConnectedError,
  ConnectorNotFoundError,
  UserNotConnectedError,
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
/** Injected connector options. */
export interface InjectedConnectorOptions {
  /** The wallet id. */
  id: string
  /** Wallet human readable name. */
  name?: string
  /** Wallet icons. */
  icon?: ConnectorIcons
  /** Provider */
  provider?: ProviderInterface
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
    return await this._wallet.isPreauthorized()
  }

  async chainId(): Promise<bigint> {
    this.ensureWallet()

    if (!this._wallet) {
      throw new ConnectorNotConnectedError()
    }

    const chainIdHex = await this._wallet.provider.getChainId()
    const chainId = BigInt(chainIdHex)
    return chainId
  }

  private async onAccountsChanged(accounts: string[] | string): Promise<void> {
    let account: string | string[]
    if (typeof accounts === "string") {
      account = accounts
    } else {
      account = accounts[0]
    }

    if (account) {
      const chainId = await this.chainId()
      this.emit("change", { account, chainId })
    } else {
      this.emit("disconnect")
    }
  }

  private onNetworkChanged(network?: string): void {
    switch (network) {
      // Argent
      case "SN_MAIN":
        this.emit("change", {
          chainId: BigInt(constants.StarknetChainId.SN_MAIN),
        })
        break
      case "SN_GOERLI":
        this.emit("change", {
          chainId: BigInt(constants.StarknetChainId.SN_GOERLI),
        })
        break
      // Braavos
      case "mainnet-alpha":
        this.emit("change", {
          chainId: BigInt(constants.StarknetChainId.SN_MAIN),
        })
        break
      case "goerli-alpha":
        this.emit("change", {
          chainId: BigInt(constants.StarknetChainId.SN_GOERLI),
        })
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

    let accounts
    try {
      accounts = await this._wallet.enable({ starknetVersion: "v5" })
    } catch {
      // NOTE: Argent v3.0.0 swallows the `.enable` call on reject, so this won't get hit.
      throw new UserRejectedRequestError()
    }

    if (!this._wallet.isConnected || !accounts) {
      // NOTE: Argent v3.0.0 swallows the `.enable` call on reject, so this won't get hit.
      throw new UserRejectedRequestError()
    }

    this._wallet.on("accountsChanged", async (accounts: string[] | string) => {
      await this.onAccountsChanged(accounts)
    })

    this._wallet.on("networkChanged", (network?: string) => {
      this.onNetworkChanged(network)
    })

    await this.onAccountsChanged(accounts)

    const account = this._wallet.account.address
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

    if (!this._wallet?.isConnected) {
      throw new UserNotConnectedError()
    }
  }

  async account(): Promise<AccountInterface> {
    this.ensureWallet()

    if (!this._wallet || !this._wallet.account) {
      throw new ConnectorNotConnectedError()
    }

    return this._wallet.account
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
    if (this._options.icon) {
      return this._options.icon
    }

    if (this._wallet?.icon) {
      return {
        dark: this._wallet.icon,
        light: this._wallet.icon,
      }
    }

    return {
      dark: WALLET_NOT_FOUND_ICON_DARK,
      light: WALLET_NOT_FOUND_ICON_LIGHT,
    }
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
      const { provider } = this._options
      if (provider) {
        Object.assign(wallet, {
          provider,
        })
      }

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
        // wallet's must have methods/members, see IStarknetWindowObject
        "request",
        "isConnected",
        "provider",
        "enable",
        "isPreauthorized",
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
