import type {
  Abi,
  Call,
  InvocationsDetails,
  InvokeFunctionResponse,
  Signature,
} from "starknet"
import { TypedData } from "@starknet-io/types-js"

// see https://github.com/WalletConnect/walletconnect-docs/pull/288/files
export interface IStarknetRpc {
  wallet_signTypedData(params: {
    accountAddress: string
    typedData: TypedData
  }): Promise<{ signature: Signature }>
  wallet_requestAddInvokeTransaction(params: {
    accountAddress: string
    executionRequest: {
      calls: Call[]
      abis?: Abi[]
      invocationDetails?: InvocationsDetails
    }
  }): Promise<InvokeFunctionResponse>
}
