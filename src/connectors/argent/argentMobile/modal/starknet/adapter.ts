import type {
  AddInvokeTransactionParameters,
  RequestFn,
  TypedData,
} from "@starknet-io/get-starknet-core"
import type { StarknetWindowObject } from "@starknet-io/types-js"
import { JsonRpcProvider } from "@walletconnect/jsonrpc-provider"
import type SignClient from "@walletconnect/sign-client"
import type { SignerConnection } from "@walletconnect/signer-connection"
import type { SessionTypes } from "@walletconnect/types"
import type {
  AccountInterface,
  ProviderInterface,
  SignerInterface,
} from "starknet"
import { RpcProvider, constants } from "starknet"
import type { NamespaceAdapterOptions } from "../adapter"
import { NamespaceAdapter } from "../adapter"
import { argentModal } from "../argentModal"
import { StarknetRemoteAccount } from "./account"
import { StarknetRemoteSigner } from "./signer"
import type { IStarknetRpc } from "./starknet.model"

export interface EthereumRpcConfig {
  chains: string[]
  methods: string[]
  events: string[]
}

export const serializeStarknetChainId = (chainId: string): string =>
  chainId.replace(/^SN_/, "SN")

export const deserializeStarknetChainId = (chainId: string): string =>
  chainId.replace(/^SN/, "SN_")

export class StarknetAdapter
  extends NamespaceAdapter
  implements StarknetWindowObject
{
  id = "argentMobile"
  name = "Ready (formerly Argent)"
  version = "0.1.0"
  icon = ""
  provider: ProviderInterface
  signer: undefined
  account: AccountInterface
  selectedAddress = ""

  // NamespaceAdapter
  public namespace = "starknet"
  public methods = [
    "starknet_supportedSpecs",
    "starknet_signTypedData",
    "starknet_requestAddInvokeTransaction",
    "wallet_supportedSpecs",
    "wallet_signTypedData",
    "wallet_addInvokeTransaction",
  ]
  public events = ["chainChanged", "accountsChanged"]

  public remoteSigner: SignerInterface
  public signerConnection: SignerConnection
  public rpcProvider: JsonRpcProvider
  public chainId: string
  public client: SignClient
  public session?: SessionTypes.Struct
  public rpc: EthereumRpcConfig

  private walletRpc: IStarknetRpc
  private handleRequest: Record<string, (...args: any) => any> // TODO: improve typing

  constructor({ client, chainId, rpcUrl, provider }: NamespaceAdapterOptions) {
    super()

    this.chainId = String(chainId ?? constants.NetworkName.SN_MAIN)
    this.rpc = {
      chains: chainId ? [this.formatChainId(this.chainId)] : [],
      methods: this.methods,
      events: this.events,
    }
    this.signerConnection = this.getSignerConnection(client)
    this.rpcProvider = new JsonRpcProvider(this.signerConnection)
    this.client = client
    this.registerEventListeners()

    this.walletRpc = new Proxy({} as IStarknetRpc, {
      get: (_, method: string) => (params: unknown) =>
        this.requestWallet({ method, params }),
    })

    this.remoteSigner = new StarknetRemoteSigner(this.walletRpc)

    this.provider = provider ? provider : new RpcProvider({ nodeUrl: rpcUrl })
    this.account = new StarknetRemoteAccount(
      this.provider,
      "",
      this.remoteSigner,
      this.walletRpc,
    )

    this.handleRequest = Object.freeze({
      wallet_requestChainId: this.handleRequestChainId,
      wallet_requestAccounts: this.handleRequestAccounts,
      wallet_getPermissions: this.handleGetPermissions,
      starknet_addInvokeTransaction: this.handleAddInvokeTransaction,
      starknet_signTypedData: this.handleSignTypedData,
      starknet_supportedSpecs: this.handleSupportedSpecs,
      wallet_addInvokeTransaction: this.handleAddInvokeTransaction,
      wallet_signTypedData: this.handleSignTypedData,
      wallet_supportedSpecs: this.handleSupportedSpecs,
    })
  }

  getNetworkName(chainId: string): constants.NetworkName {
    if (chainId === "SN_SEPOLIA") {
      return constants.NetworkName.SN_SEPOLIA
    }

    if (chainId === "SN_MAIN") {
      return constants.NetworkName.SN_MAIN
    }
    throw new Error(`Unknown starknet.js network name for chainId ${chainId}`)
  }

  // StarknetWindowObject
  request: RequestFn = async (call): Promise<any> => {
    if (!this.session) {
      throw new Error("No session")
    }

    let type = call.type as string

    // temporarily for backwards compatibility
    if (
      type === "wallet_addInvokeTransaction" ||
      type === "wallet_supportedSpecs" ||
      type === "wallet_signTypedData"
    ) {
      type = type.replace("wallet_", "starknet_") as string
    }

    const requestToCall = this.handleRequest[type]

    if (requestToCall) {
      return requestToCall(call.params)
    }

    throw new Error(`Not implemented: .request() for ${call.type}`)
  }

  async enable(): Promise<string[]> {
    await this.rpcProvider.connect()
    return this.accounts
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  get isConnected(): true {
    // needed to be implemented returning true since it's implementing ConnectedStarknetWindowObject
    return true
  }

  async isPreauthorized(): Promise<boolean> {
    // check if wc session is valid, if so, return true
    return Boolean(this.client.session.getAll().find(this.isValidSession))
  }

  on: StarknetWindowObject["on"] = (event, handleEvent) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.eventEmitter.on(event, handleEvent)
  }

  off: StarknetWindowObject["off"] = (event, handleEvent) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.eventEmitter.off(event, handleEvent)
  }

  private async requestWallet(request: { method: string; params: any }) {
    if (!this.session) {
      throw new Error("No session")
    }
    try {
      const { topic } = this.session
      const chainId = this.formatChainId(this.chainId)
      argentModal.showApprovalModal(request)
      const response = await this.client.request({ topic, chainId, request })
      argentModal.closeModal({ success: true })
      return response
    } catch (error: any) {
      argentModal.closeModal({ isRequest: true })
      if (error instanceof Error || (error && error.message !== undefined)) {
        throw new Error(error.message)
      }
      throw new Error("Unknown error on requestWallet")
    }
  }

  // NamespaceAdapter

  get isConnecting(): boolean {
    return this.signerConnection.connecting
  }

  public async disable(): Promise<void> {
    await this.rpcProvider.disconnect()
  }

  get isWalletConnect() {
    return true
  }

  // NamespaceAdapter private methods

  protected registerEventListeners() {
    super.registerEventListeners()
    this.eventEmitter.on("chainChanged", (_chainId: string) => {
      throw new Error("Not implemented: chainChanged")
      // TODO: update provider
    })
  }

  protected formatChainId(chainId: string): string {
    return `${this.namespace}:${serializeStarknetChainId(chainId)}`
  }

  protected parseChainId(chainId: string): string {
    return deserializeStarknetChainId(chainId.split(":")[1])
  }

  protected setAccounts(accounts: string[]) {
    this.accounts = accounts
      .filter(
        (x) =>
          this.parseChainId(this.parseAccountId(x).chainId) === this.chainId,
      )
      .map((x) => this.parseAccountId(x).address)

    const { address } = this.parseAccountId(accounts[0])
    const fixedAddress = !address.startsWith("0x") ? `0x${address}` : address
    this.account = new StarknetRemoteAccount(
      this.provider,
      fixedAddress,
      this.remoteSigner,
      this.walletRpc,
    )
    this.eventEmitter.emit("accountsChanged", this.accounts)
    this.selectedAddress = fixedAddress
  }

  private handleRequestChainId = () => {
    return this.chainId === constants.NetworkName.SN_SEPOLIA
      ? constants.StarknetChainId.SN_SEPOLIA
      : constants.StarknetChainId.SN_MAIN
  }

  private handleRequestAccounts = () => {
    return this.accounts
  }

  private handleGetPermissions = async () => {
    if (await this.isPreauthorized()) {
      return ["accounts"]
    }

    return []
  }

  private handleAddInvokeTransaction = async (
    params: AddInvokeTransactionParameters,
  ) => {
    const { calls } = params as AddInvokeTransactionParameters

    return await this.requestWallet({
      method: "starknet_requestAddInvokeTransaction",
      params: {
        accountAddress: this.account.address,
        executionRequest: {
          // will be removed when argent mobile will support entry_point and contract_address
          calls: calls?.map(({ contract_address, entry_point, ...rest }) => ({
            ...rest,
            contractAddress: contract_address,
            entrypoint: entry_point,
          })),
        },
      },
    })
  }

  private handleSignTypedData = async (params: TypedData) => {
    const typedDataParams = {
      accountAddress: this.account.address,
      typedData: params,
    }

    const response = (await this.requestWallet({
      method: "starknet_signTypedData",
      params: typedDataParams,
    })) as { signature: string[] } | string[]

    return "signature" in response ? response.signature : response
  }

  private handleSupportedSpecs = async () => {
    return await this.requestWallet({
      method: "starknet_supportedSpecs",
      params: {},
    })
  }
}
