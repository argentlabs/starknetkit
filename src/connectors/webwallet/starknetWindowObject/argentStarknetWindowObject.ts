import type { CreateTRPCProxyClient } from "@trpc/client"
import type {
  AccountChangeEventHandler,
  ConnectedStarknetWindowObject,
  NetworkChangeEventHandler,
  StarknetWindowObject,
  WalletEvents,
} from "get-starknet-core"
import type { ProviderInterface } from "starknet"

import { setPopupOptions, type AppRouter } from "../helpers/trpc"
import { MessageAccount } from "./account"
import { ENABLE_POPUP_HEIGHT, ENABLE_POPUP_WIDTH } from "../helpers/popupSizes"

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
  provider: ProviderInterface,
  proxyLink: CreateTRPCProxyClient<AppRouter>,
): WebWalletStarknetWindowObject => {
  const wallet: WebWalletStarknetWindowObject = {
    ...options,
    isConnected: false,
    provider,
    getLoginStatus: () => {
      return proxyLink.getLoginStatus.mutate()
    },
    async request(call) {
      switch (call.type) {
        case "wallet_addStarknetChain": {
          //TODO: add with implementation
          //const params = call.params as AddStarknetChainParameters
          return await proxyLink.addStarknetChain.mutate()
        }
        case "wallet_switchStarknetChain": {
          //TODO: add with implementation
          //const params = call.params as SwitchStarknetChainParameter
          return await proxyLink.switchStarknetChain.mutate()
        }
        case "wallet_watchAsset": {
          //TODO: add with implementation
          //const params = call.params as WatchAssetParameters
          /* return remoteHandle.call("watchAsset", params) */
          return await proxyLink.watchAsset.mutate()
        }
        default:
          throw new Error("not implemented")
      }
    },
    async enable(ops) {
      if (ops?.starknetVersion !== "v4") {
        throw Error("not implemented")
      }

      try {
        setPopupOptions({
          width: ENABLE_POPUP_WIDTH,
          height: ENABLE_POPUP_HEIGHT,
          location: "/interstitialLogin",
        })
        const enablePromise = proxyLink.enable.mutate()
        const selectedAddress: string = await enablePromise

        await updateStarknetWindowObject(
          wallet,
          provider,
          proxyLink,
          selectedAddress,
        )

        return [selectedAddress]
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message)
        }
        throw new Error("Unknow error on enable wallet")
      }
    },
    async isPreauthorized() {
      const { isLoggedIn, isPreauthorized } =
        await proxyLink.getLoginStatus.mutate()
      return Boolean(isLoggedIn && isPreauthorized)
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

async function updateStarknetWindowObject(
  windowObject: StarknetWindowObject,
  provider: ProviderInterface,
  proxyLink: CreateTRPCProxyClient<AppRouter>,
  walletAddress: string,
): Promise<ConnectedStarknetWindowObject> {
  if (windowObject.isConnected) {
    return windowObject
  }

  const chainId = await provider.getChainId()

  const valuesToAssign: Pick<
    ConnectedStarknetWindowObject,
    "isConnected" | "chainId" | "selectedAddress" | "account" | "provider"
  > = {
    isConnected: true,
    chainId,
    selectedAddress: walletAddress,
    account: new MessageAccount(provider, walletAddress, proxyLink),
    provider,
  }

  return Object.assign(windowObject, valuesToAssign)
}
