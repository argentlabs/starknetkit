import type { StarknetWindowObject } from "get-starknet-core"
import { getStarknet } from "get-starknet-core"
import { AccountInterface, constants } from "starknet"
import {
  ConnectorNotConnectedError,
  ConnectorNotFoundError,
  UserNotConnectedError,
  UserRejectedRequestError,
} from "../../errors"
import { Connector, type ConnectorIcons } from "../connector"

/** Injected connector options. */
export interface InjectedConnectorOptions {
  /** The wallet id. */
  id: string

  /** Wallet icons. */
  icon: ConnectorIcons
}

export class InjectedConnector extends Connector {
  private _wallet?: StarknetWindowObject
  private _options: InjectedConnectorOptions

  constructor({ options }: { options: InjectedConnectorOptions }) {
    super()
    this._options = options
  }

  available(): boolean {
    this.ensureWallet()
    return this._wallet !== undefined
  }

  async ready(): Promise<boolean> {
    await this.ensureWallet()

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

  async connect(): Promise<AccountInterface> {
    await this.ensureWallet()

    if (!this._wallet) {
      throw new ConnectorNotFoundError()
    }

    let accounts: string[]
    try {
      accounts = await this._wallet.enable({ starknetVersion: "v5" })
    } catch {
      // NOTE: Argent v3.0.0 swallows the `.enable` call on reject, so this won't get hit.
      throw new UserRejectedRequestError()
    }

    if (!this._wallet.isConnected) {
      // NOTE: Argent v3.0.0 swallows the `.enable` call on reject, so this won't get hit.
      throw new UserRejectedRequestError()
    }

    // This is to ensure that v5 account interface is used.
    // TODO: add back once Braavos updates their interface.
    /*
    if (!(this._wallet.account instanceof AccountInterface)) {
      throw new UnsupportedAccountInterfaceError()
    }
    */

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

    return this._wallet.account
  }

  async disconnect(): Promise<void> {
    await this.ensureWallet()

    if (!this.available()) {
      throw new ConnectorNotFoundError()
    }

    if (!this._wallet?.isConnected) {
      throw new UserNotConnectedError()
    }
  }

  async account(): Promise<AccountInterface | null> {
    await this.ensureWallet()

    if (!this._wallet) {
      throw new ConnectorNotConnectedError()
    }

    if (!this._wallet.account) {
      return null
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
    return this._options.icon
  }

  get wallet(): StarknetWindowObject {
    if (!this._wallet) {
      throw new ConnectorNotConnectedError()
    }
    return this._wallet
  }

  private async ensureWallet() {
    const starknet = getStarknet()
    const installed = await starknet.getAvailableWallets()
    const wallet = installed.filter((w) => w.id === this._options.id)[0]
    if (wallet) {
      this._wallet = wallet
    }
  }
}
