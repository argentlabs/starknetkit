import type { CreateTRPCProxyClient } from "@trpc/client"
import { SequencerProvider } from "starknet"

import { mapTargetUrlToNetworkId } from "../../../helpers/mapTargetUrlToNetworkId"
import type { AppRouter } from "../helpers/trpc"
import type { WebWalletStarknetWindowObject } from "./argentStarknetWindowObject"
import { getArgentStarknetWindowObject } from "./argentStarknetWindowObject"

export const getWebWalletStarknetObject = async (
  target: string,
  proxyLink: CreateTRPCProxyClient<AppRouter>,
): Promise<WebWalletStarknetWindowObject> => {
  const globalWindow = typeof window !== "undefined" ? window : undefined
  if (!globalWindow) {
    throw new Error("window is not defined")
  }

  const network = mapTargetUrlToNetworkId(target)
  const defaultProvider = new SequencerProvider({ network })
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
