import type { CreateTRPCProxyClient } from "@trpc/client"
import type { Signature } from "starknet"
import {
  Account,
  AccountInterface,
  ProviderInterface,
  SignerInterface,
  typedData,
} from "starknet"
import type { StarknetMethods } from "../../../types/window"

import type { AppRouter } from "../../../helpers/trpc"

class UnimplementedSigner implements SignerInterface {
  async getPubKey(): Promise<string> {
    throw new Error("Method not implemented")
  }

  async signMessage(): Promise<Signature> {
    throw new Error("Method not implemented")
  }

  async signTransaction(): Promise<Signature> {
    throw new Error("Method not implemented")
  }

  async signDeclareTransaction(): Promise<Signature> {
    throw new Error("Method not implemented")
  }

  async signDeployAccountTransaction(): Promise<Signature> {
    throw new Error("Method not implemented")
  }
}

export class MessageAccount extends Account implements AccountInterface {
  public signer = new UnimplementedSigner()

  constructor(
    provider: ProviderInterface,
    public address: string,
    private readonly proxyLink: CreateTRPCProxyClient<AppRouter>,
  ) {
    super(provider, address, new UnimplementedSigner())
  }

  execute: StarknetMethods["execute"] = async (
    calls,
    abis,
    transactionsDetail,
  ) => {
    try {
      const txHash = await this.proxyLink.execute.mutate([
        calls,
        abis,
        transactionsDetail,
      ])
      return {
        transaction_hash: txHash,
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message)
      }
      throw new Error("Error while execute a transaction")
    }
  }

  signMessage: StarknetMethods["signMessage"] = async (
    typedData: typedData.TypedData,
  ): Promise<Signature> => {
    try {
      return await this.proxyLink.signMessage.mutate([typedData])
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message)
      }
      throw new Error("Error while sign a message")
    }
  }
}
