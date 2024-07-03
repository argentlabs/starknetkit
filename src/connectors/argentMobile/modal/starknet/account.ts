import type {
  Abi,
  AccountInterface,
  AllowArray,
  Call,
  DeclareContractPayload,
  DeclareContractResponse,
  DeployContractResponse,
  InvocationsDetails,
  InvokeFunctionResponse,
  ProviderInterface,
  SignerInterface,
  UniversalDetails,
} from "starknet"
import { Account } from "starknet"

import type { IStarknetRpc } from "./starknet.model"

export class StarknetRemoteAccount extends Account implements AccountInterface {
  constructor(
    provider: ProviderInterface,
    address: string,
    signer: SignerInterface,
    private wallet: IStarknetRpc,
  ) {
    super(provider, address, signer)
  }

  public async execute(
    transactions: AllowArray<Call>,
    abisOrDetails?: Abi[] | UniversalDetails,
    transactionsDetail: UniversalDetails = {},
  ): Promise<InvokeFunctionResponse> {
    const calls = Array.isArray(transactions) ? transactions : [transactions]
    const details =
      abisOrDetails === undefined || Array.isArray(abisOrDetails)
        ? transactionsDetail
        : abisOrDetails

    return await this.wallet.wallet_requestAddInvokeTransaction({
      accountAddress: this.address,
      executionRequest: { calls, invocationDetails: details },
    })
  }

  public async declare(
    _contractPayload: DeclareContractPayload,
    _transactionsDetail?: InvocationsDetails | undefined,
  ): Promise<DeclareContractResponse> {
    throw new Error("Not supported via Argent Login")
  }

  public async deployAccount(
    _contractPayload: any,
    _transactionsDetail?: InvocationsDetails | undefined,
  ): Promise<DeployContractResponse> {
    throw new Error("Not supported via Argent Login")
  }
}
