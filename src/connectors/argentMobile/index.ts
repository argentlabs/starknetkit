import type {
  AccountChangeEventHandler,
  StarknetWindowObject,
} from "get-starknet-core"
import type { AccountInterface, ProviderInterface } from "starknet"
import { constants } from "starknet"
import { DEFAULT_ARGENT_MOBILE_ICON, DEFAULT_PROJECT_ID } from "./constants"
import {
  ConnectorNotConnectedError,
  ConnectorNotFoundError,
  UserNotConnectedError,
  UserRejectedRequestError,
} from "../../errors"
import { resetWalletConnect } from "../../helpers/resetWalletConnect"
import {
  Connector,
  type ConnectorData,
  type ConnectorIcons,
} from "../connector"
import type { StarknetAdapter } from "./modal/starknet/adapter"
import { removeStarknetLastConnectedWallet } from "../../helpers/lastConnected"
import { getRandomPublicRPCNode } from "../../helpers/publicRcpNodes"

export interface ArgentMobileConnectorOptions {
  dappName?: string
  projectId?: string
  chainId?: constants.NetworkName
  description?: string
  url?: string
  icons?: string[]
  provider?: ProviderInterface
  rpcUrl?: string
}

export class ArgentMobileConnector extends Connector {
  private _wallet: StarknetWindowObject | null = null
  private _options: ArgentMobileConnectorOptions

  constructor(options: ArgentMobileConnectorOptions = {}) {
    super()
    this._options = options
  }

  available(): boolean {
    return true
  }

  async ready(): Promise<boolean> {
    // check if session is valid and retrieve the wallet
    // if no sessions, it will show the login modal
    await this.ensureWallet()
    if (!this._wallet) {
      return false
    }

    return this._wallet.isPreauthorized()
  }

  get id(): string {
    return "argentMobile"
  }

  get name(): string {
    return "Argent (mobile)"
  }

  get icon(): ConnectorIcons {
    return {
      dark: DEFAULT_ARGENT_MOBILE_ICON,
      light: DEFAULT_ARGENT_MOBILE_ICON,
    }
  }

  get wallet(): StarknetWindowObject {
    if (!this._wallet) {
      throw new ConnectorNotConnectedError()
    }
    return this._wallet
  }

  async connect(): Promise<ConnectorData> {
    await this.ensureWallet()

    if (!this._wallet) {
      throw new ConnectorNotFoundError()
    }

    const account = this._wallet.account as unknown as AccountInterface

    const chainId = await this.chainId()

    return {
      account: account.address,
      chainId,
    }
  }

  async disconnect(): Promise<void> {
    // wallet connect rpc enable
    await (this._wallet as StarknetAdapter).disable()
    resetWalletConnect()

    if (!this.available() && !this._wallet) {
      throw new ConnectorNotFoundError()
    }

    if (!this._wallet?.isConnected) {
      throw new UserNotConnectedError()
    }

    this._wallet = null
  }

  async account(): Promise<AccountInterface> {
    if (!this._wallet || !this._wallet.account) {
      throw new ConnectorNotConnectedError()
    }

    return this._wallet.account as AccountInterface
  }

  async chainId(): Promise<bigint> {
    if (!this._wallet || !this.wallet.account || !this._wallet.provider) {
      throw new ConnectorNotConnectedError()
    }

    const chainIdHex = await this._wallet.provider.getChainId()
    const chainId = BigInt(chainIdHex)
    return chainId
  }

  // needed, methods required by starknet-react. Otherwise an exception is throwd
  async initEventListener(accountChangeCb: AccountChangeEventHandler) {
    if (!this._wallet) {
      throw new ConnectorNotConnectedError()
    }

    this._wallet.on("accountsChanged", accountChangeCb)
  }

  // needed, methods required by starknet-react. Otherwise an exception is throwd
  async removeEventListener(accountChangeCb: AccountChangeEventHandler) {
    if (!this._wallet) {
      throw new ConnectorNotConnectedError()
    }

    this._wallet.off("accountsChanged", accountChangeCb)

    this._wallet = null
  }

  private async ensureWallet(): Promise<void> {
    const { getStarknetWindowObject } = await import("./modal")
    const {
      chainId,
      projectId,
      dappName,
      description,
      url,
      icons,
      provider,
      rpcUrl,
    } = this._options

    const publicRPCNode = getRandomPublicRPCNode()
    const providerRpcUrl =
      rpcUrl ??
      (!chainId || chainId === constants.NetworkName.SN_MAIN
        ? publicRPCNode.mainnet
        : publicRPCNode.testnet)

    const options = {
      chainId: chainId ?? constants.NetworkName.SN_MAIN,
      name: dappName,
      projectId: projectId ?? DEFAULT_PROJECT_ID,
      description,
      url,
      icons,
      provider,
      rpcUrl: providerRpcUrl,
    }

    if (projectId === DEFAULT_PROJECT_ID) {
      console.log("========= NOTICE =========")
      console.log(
        "While your application will continue to function, we highly recommended",
      )
      console.log("signing up for your own API keys.")
      console.log(
        "Go to WalletConnect Cloud (https://cloud.walletconnect.com) and create a new account.",
      )
      console.log(
        "Once your account is created, create a new project and collect the Project ID",
      )
      console.log("==========================")
    }

    const _wallet = await getStarknetWindowObject(options)

    // getStarknetWindowObject returns null when the user rejects the connection
    if (!_wallet) {
      throw new UserRejectedRequestError()
    }

    this._wallet = _wallet

    // wallet connect rpc enable
    const snProvider = this._wallet as StarknetAdapter
    await snProvider.enable()
    snProvider.client.on("session_delete", () => {
      // Session was deleted -> reset the dapp state, clean up from user session, etc.
      // not calling disconnect(), because .disable() is already done by the mobile app
      resetWalletConnect()
      this._wallet = null
      removeStarknetLastConnectedWallet()
      // dapp should listen to this event and update the UI accordingly
      document.dispatchEvent(new Event("wallet_disconnected"))
    })
  }
}

export { isInArgentMobileAppBrowser } from "./helpers"
