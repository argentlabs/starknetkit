import type { StarknetWindowObject } from "@starknet-io/types-js"

export function getInjectedArgentX() {
  if (typeof window === "undefined") {
    return undefined
  }
  return window?.starknet_argentX as
    | (StarknetWindowObject & {
        isInAppBrowser: boolean
      })
    | undefined
}
