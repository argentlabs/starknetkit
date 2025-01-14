import sn from "@starknet-io/get-starknet-core"
import { type AccountChangeEventHandler } from "@starknet-io/get-starknet-core"
import {
  Permission,
  type RequestFnCall,
  type RpcMessage,
  type RpcTypeToMessageMap,
  type StarknetWindowObject,
} from "@starknet-io/types-js"
import {
  Account,
  AccountInterface,
  constants,
  ProviderInterface,
  type ProviderOptions,
} from "starknet"
import {
  ConnectorNotConnectedError,
  ConnectorNotFoundError,
  UserRejectedRequestError,
} from "../../../errors"
import { getStarknetChainId } from "../../../helpers/getStarknetChainId"
import { removeStarknetLastConnectedWallet } from "../../../helpers/lastConnected"
import { getRandomPublicRPCNode } from "../../../helpers/publicRcpNodes"
import { resetWalletConnect } from "../../../helpers/resetWalletConnect"
import {
  Connector,
  type ConnectArgs,
  type ConnectorData,
  type ConnectorIcons,
} from "../connector"
import { type InjectedConnectorOptions } from "../../injected"
import { DEFAULT_ARGENT_MOBILE_ICON, DEFAULT_PROJECT_ID } from "./constants"
import { isInArgentMobileAppBrowser } from "../helpers"
import type { StarknetAdapter } from "./modal/starknet/adapter"
import { ArgentX } from "../../injected/argentX"
import { getModalWallet } from "../../../helpers/mapModalWallets"

export interface ArgentMobileConnectorOptions {
  dappName: string
  projectId?: string
  chainId?: constants.NetworkName
  description?: string
  url: string
  icons?: string[]
  rpcUrl?: string
  onlyQR?: boolean
}

export class ArgentMobileBaseConnector extends Connector {
  private _wallet: StarknetWindowObject | null = null
  private readonly _options: ArgentMobileConnectorOptions

  constructor(options: ArgentMobileConnectorOptions) {
    super()
    this._options = options
  }

  available(): boolean {
    return true
  }

  async ready(): Promise<boolean> {
    if (!this._wallet) {
      return false
    }

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

  async connect(_args: ConnectArgs = {}): Promise<ConnectorData> {
    await this.ensureWallet({ onlyQRCode: _args?.onlyQRCode })

    if (!this._wallet) {
      throw new ConnectorNotFoundError()
    }

    const accounts = await this._wallet.request({
      type: "wallet_requestAccounts",
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
    const accounts = await this._wallet.request({
      type: "wallet_requestAccounts",
      params: { silent_mode: true },
    })

    return new Account(provider, accounts[0], "")
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

  private async ensureWallet(
    props:
      | {
          onlyQRCode?: boolean
        }
      | undefined,
  ): Promise<void> {
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
      onlyQRCode: props?.onlyQRCode,
      chainId: chainId ?? constants.NetworkName.SN_MAIN,
      name: dappName,
      projectId: projectId ?? DEFAULT_PROJECT_ID,
      description,
      url,
      icons,
      rpcUrl: providerRpcUrl,
      modalWallet: getModalWallet(this, await sn.getDiscoveryWallets()),
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

export interface ArgentMobileConnectorInitParams {
  options: ArgentMobileConnectorOptions
  inAppBrowserOptions?: Omit<InjectedConnectorOptions, "id">
}

export class ArgentMobileConnector {
  static init({
    options,
    inAppBrowserOptions,
  }: ArgentMobileConnectorInitParams): Connector {
    if (isInArgentMobileAppBrowser()) {
      return new ArgentX(inAppBrowserOptions)
    } else {
      return new ArgentMobileBaseConnector(options)
    }
  }
}

export { isInArgentMobileAppBrowser }
