import type { CreateTRPCProxyClient } from "@trpc/client"
import { ProviderInterface, RpcProvider } from "starknet"

import { mapTargetUrlToNodeUrl } from "../helpers/mapTargetUrlToNodeUrl"
import type { AppRouter } from "../helpers/trpc"
import type { WebWalletStarknetWindowObject } from "./argentStarknetWindowObject"
import { getArgentStarknetWindowObject } from "./argentStarknetWindowObject"

export const getWebWalletStarknetObject = async (
  target: string,
  proxyLink: CreateTRPCProxyClient<AppRouter>,
  provider?: ProviderInterface,
): Promise<WebWalletStarknetWindowObject> => {
  const globalWindow = typeof window !== "undefined" ? window : undefined
  if (!globalWindow) {
    throw new Error("window is not defined")
  }

  const nodeUrl = mapTargetUrlToNodeUrl(target)
  const defaultProvider = provider ?? new RpcProvider({ nodeUrl })
  const starknetWindowObject = getArgentStarknetWindowObject(
    {
      host: globalWindow.location.origin,
      id: "argentWebWallet",
      icon: "https://www.argent.xyz/favicon.ico",
      name: "Argent Web Wallet",
      version: "1.0.0",
    },
    defaultProvider,
    proxyLink,
  )

  return starknetWindowObject
}
