import {
  Permission,
  type AccountChangeEventHandler,
  type RequestFnCall,
  type RpcMessage,
  type RpcTypeToMessageMap,
  type StarknetWindowObject,
  type TypedData,
} from "@starknet-io/types-js"
import type { TRPCClientError } from "@trpc/client"
import {
  WalletAccount,
  type AccountInterface,
  type ProviderInterface,
  type ProviderOptions,
} from "starknet"
import {
  ConnectorNotConnectedError,
  ConnectorNotFoundError,
  UserRejectedRequestError,
} from "../../errors"
import { getStarknetChainId } from "../../helpers/getStarknetChainId"
import { removeStarknetLastConnectedWallet } from "../../helpers/lastConnected"
import {
  Connector,
  type ConnectArgs,
  type ConnectorData,
  type ConnectorIcons,
} from "../connector"
import { DEFAULT_WEBWALLET_ICON, DEFAULT_WEBWALLET_URL } from "./constants"
import { ConnectAndSignSessionError, WebwalletError } from "./errors"
import { openWebwallet } from "./helpers/openWebwallet"
import { setPopupOptions } from "./helpers/trpc"
import {
  type Theme,
  type WebWalletStarknetWindowObject,
} from "./starknetWindowObject/argentStarknetWindowObject"
import type { ApprovalRequest } from "./starknetWindowObject/types"

const WEBWALLET_LOGOUT_EVENT = "webwallet_logout"

let _wallet: StarknetWindowObject | null = null
let _address: string | null = null

interface WebWalletConnectorOptions {
  url?: string
  theme?: Theme
  ssoToken?: string
  authorizedPartyId?: string
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
    if (!this._wallet) {
      await this.ensureWallet()
    }

    if (!this._wallet) {
      this._wallet = null
      _address = null

      return false
    } else {
      try {
        const permissions = await this._wallet.request({
          type: "wallet_getPermissions",
        })

        return (permissions as Permission[]).includes(Permission.ACCOUNTS)
      } catch {
        return false
      }
    }
  }

  get id(): string {
    this._wallet = _wallet
    return this._wallet?.id || "argentWebWallet"
  }

  get name(): string {
    this._wallet = _wallet
    return this._wallet?.name || "Web Wallet"
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
    return "Powered by Ready"
  }

  async connectAndSignSession({
    callbackData,
    approvalRequests,
    sessionTypedData,
  }: {
    callbackData?: string
    approvalRequests: ApprovalRequest[]
    sessionTypedData: TypedData
  }) {
    if (!this._wallet) {
      await this.ensureWallet()
    }

    if (!this._wallet) {
      throw new ConnectorNotFoundError()
    }

    try {
      return await (
        this._wallet as WebWalletStarknetWindowObject
      ).connectAndSignSession({
        callbackData,
        approvalRequests,
        sessionTypedData,
        theme: this._options.theme,
      })
    } catch (error) {
      if (
        error instanceof Error &&
        (error.constructor.name === "TRPCClientError" ||
          error.name === "TRPCClientError")
      ) {
        const trpcError = error as TRPCClientError<any>

        const message =
          trpcError.shape.data.webwalletErrorMessage || trpcError.message
        const code =
          trpcError.shape.data.webwalletErrorCode || trpcError.shape.message

        throw new ConnectAndSignSessionError(message, code)
      }
      throw new Error(error instanceof Error ? error.message : String(error))
    }
  }

  async connect(_args: ConnectArgs = {}): Promise<ConnectorData> {
    if (!this._wallet) {
      await this.ensureWallet()
    }

    if (!this._wallet) {
      throw new ConnectorNotFoundError()
    }

    try {
      let account, chainId

      if (this._options.ssoToken) {
        const ssoReponse = await (
          this._wallet as WebWalletStarknetWindowObject
        ).connectWebwalletSSO(
          this._options.ssoToken,
          this._options.authorizedPartyId,
        )
        account = ssoReponse.account
        chainId = ssoReponse.chainId
      } else {
        const connectResponse = await (
          this._wallet as WebWalletStarknetWindowObject
        ).connectWebwallet({
          theme: this._options.theme,
        })
        account = connectResponse.account
        chainId = connectResponse.chainId
      }

      if (!account || !chainId) {
        return {}
      }

      const hexChainId = getStarknetChainId(chainId)

      _address = account[0]

      return {
        account: account[0],
        chainId: BigInt(hexChainId),
      }
    } catch {
      throw new UserRejectedRequestError()
    }
  }

  async request<T extends RpcMessage["type"]>(
    call: RequestFnCall<T>,
  ): Promise<RpcTypeToMessageMap[T]["result"]> {
    if (!this._wallet) {
      await this.ensureWallet()
    }

    if (!this._wallet) {
      throw new ConnectorNotConnectedError()
    }
    try {
      return await this._wallet.request(call)
    } catch (error) {
      if (
        error instanceof Error &&
        (error.constructor.name === "TRPCClientError" ||
          error.name === "TRPCClientError")
      ) {
        const trpcError = error as TRPCClientError<any>

        const message =
          trpcError.shape.data.webwalletErrorMessage || trpcError.message
        const code =
          trpcError.shape.data.webwalletErrorCode || trpcError.shape.message

        if (code === "USER_LOGGED_OUT") {
          _wallet = null
          _address = null
          this._wallet = null
          document.dispatchEvent(new Event(WEBWALLET_LOGOUT_EVENT))
        }

        throw new WebwalletError(message, code)
      }

      throw new UserRejectedRequestError()
    }
  }

  async disconnect(): Promise<void> {
    if (!this.available() && !this._wallet) {
      throw new ConnectorNotFoundError()
    }

    _wallet = null
    _address = null
    this._wallet = _wallet
    removeStarknetLastConnectedWallet()
  }

  async account(
    provider: ProviderOptions | ProviderInterface,
  ): Promise<AccountInterface> {
    this._wallet = _wallet

    if (!this._wallet) {
      throw new ConnectorNotConnectedError()
    }

    if (!_address) {
      throw new ConnectorNotConnectedError()
    }

    return new WalletAccount(provider, this._wallet, _address, undefined)
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
    _address = null
    this._wallet = null
  }

  private async ensureWallet(): Promise<void> {
    const origin = this._options.url || DEFAULT_WEBWALLET_URL
    setPopupOptions({
      origin,
      location: "/interstitialLogin",
    })

    _wallet = (await openWebwallet(origin)) ?? null

    this._wallet = _wallet
  }
}

const handleWebwalletLogoutEvent = (callback: () => void) => {
  document.addEventListener(WEBWALLET_LOGOUT_EVENT, () => {
    callback()
  })
}

export {
  ConnectAndSignSessionError,
  handleWebwalletLogoutEvent,
  WEBWALLET_LOGOUT_EVENT,
  WebwalletError,
}
export type { ApprovalRequest, WebWalletStarknetWindowObject }
