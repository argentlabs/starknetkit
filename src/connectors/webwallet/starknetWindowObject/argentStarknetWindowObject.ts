import type { CreateTRPCProxyClient } from "@trpc/client"
import type {
  AccountChangeEventHandler,
  NetworkChangeEventHandler,
  StarknetWindowObject,
  WalletEvents,
} from "get-starknet-core"
import type { constants } from "starknet"

import { type AppRouter } from "../helpers/trpc"

export const userEventHandlers: WalletEvents[] = []

export type Variant = "argentX" | "argentWebWallet"

export interface GetArgentStarknetWindowObject {
  id: Variant
  icon: string
  name: string
  version: string
  host: string
}

export type LoginStatus = {
  isLoggedIn?: boolean
  hasSession?: boolean
  isPreauthorized?: boolean
}

export type WebWalletStarknetWindowObject = StarknetWindowObject & {
  getLoginStatus(): Promise<LoginStatus>
}

export const getArgentStarknetWindowObject = (
  options: GetArgentStarknetWindowObject,
  proxyLink: CreateTRPCProxyClient<AppRouter>,
): WebWalletStarknetWindowObject => {
  const wallet: WebWalletStarknetWindowObject = {
    ...options,
    getLoginStatus: () => {
      return proxyLink.getLoginStatus.mutate()
    },
    async request(call) {
      switch (call.type) {
        case "wallet_requestAccounts": {
          return proxyLink.requestAccounts.mutate(call.params as any)
        }

        case "starknet_signTypedData": {
          return proxyLink.signTypedData.mutate(call.params as any)
        }

        case "wallet_getPermissions": {
          return proxyLink.getPermissions.mutate()
        }

        case "starknet_addInvokeTransaction": {
          const hash = await proxyLink.addInvokeTransaction.mutate(
            (call.params as any).calls,
          )

          return { transaction_hash: hash }
        }

        case "wallet_requestChainId": {
          return (await proxyLink.requestChainId.mutate()) as constants.StarknetChainId
        }

        case "wallet_addStarknetChain": {
          //TODO: add with implementation
          //const params = call.params as AddStarknetChainParameters
          return proxyLink.addStarknetChain.mutate(call.params as any)
        }
        case "wallet_switchStarknetChain": {
          //TODO: add with implementation
          //const params = call.params as SwitchStarknetChainParameter
          return proxyLink.switchStarknetChain.mutate(call.params as any)
        }
        case "wallet_watchAsset": {
          //TODO: add with implementation
          //const params = call.params as WatchAssetParameters
          /* return remoteHandle.call("watchAsset", params) */
          return proxyLink.watchAsset.mutate()
        }
        default:
          throw new Error("not implemented")
      }
    },
    on: (event, handleEvent) => {
      if (event === "accountsChanged") {
        userEventHandlers.push({
          type: event,
          handler: handleEvent as AccountChangeEventHandler,
        })
      } else if (event === "networkChanged") {
        userEventHandlers.push({
          type: event,
          handler: handleEvent as NetworkChangeEventHandler,
        })
      } else {
        throw new Error(`Unknwown event: ${event}`)
      }
    },
    off: (event, handleEvent) => {
      if (event !== "accountsChanged" && event !== "networkChanged") {
        throw new Error(`Unknwown event: ${event}`)
      }

      const eventIndex = userEventHandlers.findIndex(
        (userEvent) =>
          userEvent.type === event && userEvent.handler === handleEvent,
      )

      if (eventIndex >= 0) {
        userEventHandlers.splice(eventIndex, 1)
      }
    },
  }

  // TODO: handle network and account changes
  return wallet
}
