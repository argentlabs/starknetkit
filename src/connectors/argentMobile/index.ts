import type {
  AccountChangeEventHandler,
  StarknetWindowObject,
} from "get-starknet-core"
import type { AccountInterface } from "starknet"
import { constants } from "starknet"
import { DEFAULT_ARGENT_MOBILE_ICON, DEFAULT_PROJECT_ID } from "./constants"
import {
  ConnectorNotConnectedError,
  ConnectorNotFoundError,
  UserNotConnectedError,
} from "../../errors"
import { resetWalletConnect } from "../../helpers/resetWalletConnect"
import { Connector, type ConnectorIcons } from "../connector"
import type { StarknetAdapter } from "./modal/starknet/adapter"
import { removeStarknetLastConnectedWallet } from "../../helpers/lastConnected"

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

  async connect(): Promise<AccountInterface> {
    await this.ensureWallet()

    if (!this._wallet) {
      throw new ConnectorNotFoundError()
    }

    return this._wallet.account as unknown as AccountInterface
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
      chainId: chainId ?? constants.NetworkName.SN_MAIN,
      name: dappName,
      projectId: projectId ?? DEFAULT_PROJECT_ID,
      description,
      url,
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
