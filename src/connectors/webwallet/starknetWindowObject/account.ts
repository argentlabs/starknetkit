import type { CreateTRPCProxyClient } from "@trpc/client"
import type { Signature } from "starknet"
import {
  Account,
  AccountInterface,
  ProviderInterface,
  SignerInterface,
} from "starknet"
import type { TypedData } from "starknet-types"
import type { StarknetMethods } from "../../../types/window"

import {
  EXECUTE_POPUP_HEIGHT,
  EXECUTE_POPUP_WIDTH,
  SIGN_MESSAGE_POPUP_HEIGHT,
  SIGN_MESSAGE_POPUP_WIDTH,
} from "../helpers/popupSizes"
import { setPopupOptions, type AppRouter } from "../helpers/trpc"

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

  execute = async (
    calls: Parameters<StarknetMethods["execute"]>[0],
    abiOrDetails?: Parameters<StarknetMethods["execute"]>[1] | any[],
    transactionDetails: Parameters<StarknetMethods["execute"]>[1] = {},
  ): ReturnType<StarknetMethods["execute"]> => {
    try {
      setPopupOptions({
        width: EXECUTE_POPUP_WIDTH,
        height: EXECUTE_POPUP_HEIGHT,
        location: "/review",
      })
      if (
        Array.isArray(calls) &&
        calls[0] &&
        calls[0].entrypoint === "use_offchain_session"
      ) {
        setPopupOptions({
          width: 1,
          height: 1,
          location: "/executeSessionTx",
          atLeftBottom: true,
        })
      }

      const details =
        abiOrDetails === undefined || Array.isArray(abiOrDetails)
          ? transactionDetails
          : abiOrDetails

      const txHash = await this.proxyLink.execute.mutate([calls, details])
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
    typedData: TypedData,
  ): Promise<Signature> => {
    try {
      setPopupOptions({
        width: SIGN_MESSAGE_POPUP_WIDTH,
        height: SIGN_MESSAGE_POPUP_HEIGHT,
        location: "/signMessage",
      })
      return await this.proxyLink.signMessage.mutate([typedData])
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message)
      }
      throw new Error("Error while sign a message")
    }
  }
}
