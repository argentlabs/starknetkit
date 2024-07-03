import { type AccountChangeEventHandler } from "@starknet-io/get-starknet-core"
import {
  AccountInterface,
  ProviderInterface,
  ProviderOptions,
  WalletAccount,
  constants,
} from "starknet"
import {
  Permission,
  RequestFnCall,
  RpcMessage,
  RpcTypeToMessageMap,
  type StarknetWindowObject,
} from "@starknet-io/types-js"
import {
  ConnectorNotConnectedError,
  ConnectorNotFoundError,
  UserRejectedRequestError,
} from "../../errors"
import { getStarknetChainId } from "../../helpers/getStarknetChainId"
import { removeStarknetLastConnectedWallet } from "../../helpers/lastConnected"
import { getRandomPublicRPCNode } from "../../helpers/publicRcpNodes"
import { resetWalletConnect } from "../../helpers/resetWalletConnect"
import {
  Connector,
  type ConnectorData,
  type ConnectorIcons,
} from "../connector"
import { DEFAULT_ARGENT_MOBILE_ICON, DEFAULT_PROJECT_ID } from "./constants"
import type { StarknetAdapter } from "./modal/starknet/adapter"

export interface ArgentMobileConnectorOptions {
  dappName?: string
  projectId?: string
  chainId?: constants.NetworkName
  description?: string
  url?: string
  icons?: string[]
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

    const permissions = await this._wallet.request({
      type: "wallet_getPermissions",
    })

    return (permissions as Permission[]).includes(Permission.ACCOUNTS)
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

    const accounts = await this._wallet.request({
      type: "wallet_requestAccounts",
      params: { silent_mode: false }, // explicit to show the modal
    })

    const chainId = await this.chainId()

    return {
      account: accounts[0],
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

    this._wallet = null
  }

  async account(
    provider: ProviderOptions | ProviderInterface,
  ): Promise<AccountInterface> {
    if (!this._wallet) {
      throw new ConnectorNotConnectedError()
    }

    return new WalletAccount(provider, this._wallet)
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

  async request<T extends RpcMessage["type"]>(
    call: RequestFnCall<T>,
  ): Promise<RpcTypeToMessageMap[T]["result"]> {
    this.ensureWallet()

    if (!this._wallet) {
      throw new ConnectorNotConnectedError()
    }

    try {
      return await this._wallet.request(call)
    } catch {
      throw new UserRejectedRequestError()
    }
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
    const { chainId, projectId, dappName, description, url, icons, rpcUrl } =
      this._options

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
