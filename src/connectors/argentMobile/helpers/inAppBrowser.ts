import type { StarknetWindowObject } from "starknet-types"

export const isInArgentMobileAppBrowser = (): boolean => {
  if (!window?.starknet_argentX) {
    return false
  }

  const starknetMobile =
    window?.starknet_argentX as unknown as StarknetWindowObject & {
      isInAppBrowser: boolean
    }

  return starknetMobile?.isInAppBrowser
}
