import { JsonRpcProvider } from "@walletconnect/jsonrpc-provider"
import type SignClient from "@walletconnect/sign-client"
import type { SignerConnection } from "@walletconnect/signer-connection"
import type { SessionTypes } from "@walletconnect/types"
import type {
  ConnectedStarknetWindowObject,
  RpcMessage,
} from "get-starknet-core"
import type {
  AccountInterface,
  ProviderInterface,
  SignerInterface,
} from "starknet"
import { RpcProvider, constants } from "starknet"

import type { NamespaceAdapterOptions } from "../adapter"
import { NamespaceAdapter } from "../adapter"
import { StarknetRemoteAccount } from "./account"
import { StarknetRemoteSigner } from "./signer"
import type { IStarknetRpc } from "./starknet.model"
import { argentModal } from "../argentModal"

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
  implements ConnectedStarknetWindowObject
{
  id = "argentMobile"
  name = "Argent Mobile"
  version = "0.1.0"
  icon = ""
  provider: ProviderInterface
  signer: undefined
  account: AccountInterface
  selectedAddress = ""

  // NamespaceAdapter
  public namespace = "starknet"
  public methods = [
    "starknet_signTypedData",
    "starknet_requestAddInvokeTransaction",
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
  }

  getNetworkName(chainId: string): constants.NetworkName {
    if (chainId === "SN_GOERLI") {
      return constants.NetworkName.SN_GOERLI
    }

    if (chainId === "SN_MAIN") {
      return constants.NetworkName.SN_MAIN
    }
    throw new Error(`Unknown starknet.js network name for chainId ${chainId}`)
  }

  // StarknetWindowObject

  async request<T extends RpcMessage>(
    _call: Omit<T, "result">,
  ): Promise<T["result"]> {
    // request() is mostly used  for messages like `wallet_watchAsset` etc.
    // regular transactions calls are done through .account.execute
    throw new Error("Not implemented: .request()")
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

  on: ConnectedStarknetWindowObject["on"] = (event, handleEvent) => {
    this.eventEmitter.on(event, handleEvent)
  }

  off: ConnectedStarknetWindowObject["off"] = (event, handleEvent) => {
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
      argentModal.closeModal("animateSuccess")
      return response
    } catch (error) {
      argentModal.closeModal()
      if (error instanceof Error) {
        throw new Error(error.message)
      }
      throw new Error("Unknow error on requestWallet")
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
}
