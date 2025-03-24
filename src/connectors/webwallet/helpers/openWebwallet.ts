import type { StarknetWindowObject } from "@starknet-io/types-js"
import { mapTargetUrlToNetworkId } from "../../../helpers/mapTargetUrlToNetworkId"
import { getWebWalletStarknetObject } from "../starknetWindowObject/getWebWalletStarknetObject"
import { createModal } from "../starknetWindowObject/wormhole"
import { fetchAllowedDapps } from "./fetchAllowedDapps"
import { trpcProxyClient } from "./trpc"

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
): Promise<StarknetWindowObject | undefined> => {
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
    return await getWebWalletStarknetObject(
      origin,
      windowProxyClient,
      undefined,
    )
  }

  const network = mapTargetUrlToNetworkId(origin)
  const { allowedDapps } = await fetchAllowedDapps(network)

  if (allowedDapps.includes(window.location.hostname)) {
    const backdropId = "argent-webwallet-backdrop"
    const iframeId = "argent-webwallet-iframe"

    const existingBackdrop = document.getElementById(backdropId)
    const existingIframe = document.getElementById(iframeId)

    // avoid duplicate iframes
    if (existingIframe && existingIframe && existingBackdrop) {
      existingIframe.remove()
      existingBackdrop.remove()
    }
    const { iframe, backdrop } = await createModal(origin, false)

    const iframeTrpcProxyClient = trpcProxyClient({
      iframe: iframe.contentWindow ?? undefined,
    })

    const starknetWindowObject = await getWebWalletStarknetObject(
      origin,
      iframeTrpcProxyClient,
      { iframe, backdrop },
    )
    return starknetWindowObject
  } else {
    const windowProxyClient = trpcProxyClient({})
    return await getWebWalletStarknetObject(
      origin,
      windowProxyClient,
      undefined,
    )
  }
}
