import type { StarknetWindowObject } from "get-starknet-core"

export const isInArgentMobileAppBrowser = (): boolean => {
  if (!window?.starknet_argentX) {
    return false
  }

  const starknetMobile = window?.starknet_argentX as StarknetWindowObject & {
    isInAppBrowser: boolean
  }

  return starknetMobile?.isInAppBrowser
}
