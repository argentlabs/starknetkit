import type {
  AccountChangeEventHandler,
  StarknetWindowObject,
} from "get-starknet-core"
import type { AccountInterface } from "starknet"
import { constants } from "starknet"
import { DEFAULT_PROJECT_ID } from "../../constants"
import {
  ConnectorNotConnectedError,
  ConnectorNotFoundError,
  UserNotConnectedError,
} from "../../errors"
import { resetWalletConnect } from "../../helpers/resetWalletConnect"
import { Connector } from "../connector"

export interface ArgentMobileConnectorOptions {
  dappName?: string
  projectId?: string
  chainId?: constants.NetworkName
  description?: string
  url?: string
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
    if (!this._wallet) {
      return false
    }

    return this._wallet.isPreauthorized()
  }

  get id(): string {
    return "argentMobile"
  }

  get name(): string {
    return "Argent Mobile"
  }

  get icon(): string {
    return `<svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="32" height="32" rx="8" fill="#FF875B" />
    <path
      d="M18.316 8H13.684C13.5292 8 13.4052 8.1272 13.4018 8.28531C13.3082 12.7296 11.0323 16.9477 7.11513 19.9355C6.99077 20.0303 6.96243 20.2085 7.05335 20.3369L9.76349 24.1654C9.85569 24.2957 10.0353 24.3251 10.1618 24.2294C12.6111 22.3734 14.5812 20.1345 16 17.6529C17.4187 20.1345 19.389 22.3734 21.8383 24.2294C21.9646 24.3251 22.1443 24.2957 22.2366 24.1654L24.9467 20.3369C25.0375 20.2085 25.0092 20.0303 24.885 19.9355C20.9676 16.9477 18.6918 12.7296 18.5983 8.28531C18.5949 8.1272 18.4708 8 18.316 8Z"
      fill="white"
    />
  </svg>`
  }

  get wallet(): StarknetWindowObject {
    this.ensureWallet()
    if (!this._wallet) {
      throw new ConnectorNotConnectedError()
    }
    return this._wallet
  }

  async connect(): Promise<AccountInterface> {
    await this.ensureWallet()

    if (!this._wallet) {
      throw new ConnectorNotFoundError()
    }

    return this._wallet.account as unknown as AccountInterface
  }

  async disconnect(): Promise<void> {
    resetWalletConnect()

    if (!this.available() && !this._wallet) {
      throw new ConnectorNotFoundError()
    }

    if (!this._wallet?.isConnected) {
      throw new UserNotConnectedError()
    }

    this._wallet = null
  }

  async account(): Promise<AccountInterface | null> {
    /* 
    Don't throw an exception if the wallet is not connected. 
    This is needed because when argentMobile and webwallet connectors are used together with starknet-react, 
    it would always try to retrieve the account since the connectors are always available (and throw an exception since the value is null)

    https://github.com/apibara/starknet-react/blob/226e4cb1d8e9b478dc57d45a98a59a57733572bb/packages/core/src/hooks/useAccount.ts#L92
    
   */
    if (!this._wallet || !this._wallet.account) {
      return null
    }

    return this._wallet.account as AccountInterface
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
    const { chainId, projectId, dappName, description, url } = this._options
    const options = {
      chainId: chainId ?? "SN_GOERLI",
      name: dappName,
      projectId: projectId ?? DEFAULT_PROJECT_ID,
      description,
      url,
    }

    const _wallet = await getStarknetWindowObject(options)
    this._wallet = _wallet
  }
}
