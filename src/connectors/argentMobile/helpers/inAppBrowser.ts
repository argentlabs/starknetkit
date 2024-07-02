import type { StarknetWindowObject } from "@starknet-io/types-js"

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
