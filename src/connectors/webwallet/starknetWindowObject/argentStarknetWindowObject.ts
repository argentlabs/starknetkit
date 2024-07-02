import type { CreateTRPCProxyClient } from "@trpc/client"
import type { constants } from "starknet"
import type {
  AccountChangeEventHandler,
  NetworkChangeEventHandler,
  RpcTypeToMessageMap,
  StarknetWindowObject,
  WalletEvents,
} from "@starknet-io/types-js"
import {
  EXECUTE_POPUP_HEIGHT,
  EXECUTE_POPUP_WIDTH,
  SIGN_MESSAGE_POPUP_HEIGHT,
  SIGN_MESSAGE_POPUP_WIDTH,
} from "../helpers/popupSizes"
import { setPopupOptions, type AppRouter } from "../helpers/trpc"

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

        case "wallet_signTypedData": {
          const params =
            call.params as RpcTypeToMessageMap["wallet_signTypedData"]["params"]

          const isSession =
            params?.primaryType === "Session" &&
            params?.domain.name === "SessionAccount.session"

          setPopupOptions({
            width: SIGN_MESSAGE_POPUP_WIDTH,
            height: SIGN_MESSAGE_POPUP_HEIGHT,
            location: isSession ? "/signSessionKeys" : "/signMessage",
          })
          const data = Array.isArray(call.params) ? call.params : [call.params]
          return proxyLink.signTypedData.mutate(data as any)
        }

        case "wallet_getPermissions": {
          return proxyLink.getPermissions.mutate()
        }

        case "wallet_addInvokeTransaction": {
          const calls = (call.params as any).calls

          setPopupOptions({
            width: EXECUTE_POPUP_WIDTH,
            height: EXECUTE_POPUP_HEIGHT,
            location: "/review",
          })

          const hash = await proxyLink.addInvokeTransaction.mutate(calls)

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
        case "wallet_deploymentData": {
          return proxyLink.deploymentData.mutate()
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
