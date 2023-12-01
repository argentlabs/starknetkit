import { createModal } from "../starknetWindowObject/wormhole"
import { getWebWalletStarknetObject } from "../starknetWindowObject/getWebWalletStarknetObject"
import { trpcProxyClient } from "./trpc"
import type { StarknetWindowObject } from "get-starknet-core"
import { mapTargetUrlToNetworkId } from "../../../helpers/mapTargetUrlToNetworkId"
import { fetchAllowedDapps } from "./fetchAllowedDapps"

const checkIncognitoChrome = async (isChrome: boolean) => {
  return new Promise((resolve) => {
    if (!isChrome) {
      return resolve(false)
    }
    try {
      const webkitTemporaryStorage = (navigator as any).webkitTemporaryStorage
      webkitTemporaryStorage.queryUsageAndQuota(
        (_: unknown, quota: number) => {
          resolve(
            Math.round(quota / (1024 * 1024)) <
              Math.round(
                ((performance as any)?.memory?.jsHeapSizeLimit ?? 1073741824) /
                  (1024 * 1024),
              ) *
                2,
          )
        },
        () => resolve(false),
      )
    } catch {
      resolve(false)
    }
  })
}

export const openWebwallet = async (
  origin: string,
): Promise<StarknetWindowObject | null> => {
  const { userAgent } = navigator
  const isChrome = Boolean(
    navigator.vendor &&
      navigator.vendor.indexOf("Google") === 0 &&
      (navigator as any).brave === undefined &&
      !userAgent.match(/Edg/) &&
      !userAgent.match(/OPR/),
  )

  const isChromeIncognito = await checkIncognitoChrome(isChrome)

  // if not chrome or is chrome incognito
  // use the popup mode and avoid checking allowed dapps for iframes
  if (!isChrome || isChromeIncognito) {
    const windowProxyClient = trpcProxyClient({})
    return await getWebWalletStarknetObject(origin, windowProxyClient)
  }

  const network = mapTargetUrlToNetworkId(origin)
  const { allowedDapps } = await fetchAllowedDapps(network)

  if (allowedDapps.includes(window.location.hostname)) {
    const { iframe, modal } = await createModal(origin, false)
    const windowProxyClient = trpcProxyClient({})
    const isConnected = await windowProxyClient.authorize.mutate()
    if (isConnected) {
      const starknetWindowObject = await getWebWalletStarknetObject(
        origin,
        trpcProxyClient({ iframe: iframe.contentWindow }),
        { modal, iframe },
      )
      return starknetWindowObject
    }
  } else {
    const windowProxyClient = trpcProxyClient({})
    return await getWebWalletStarknetObject(origin, windowProxyClient)
  }
}
