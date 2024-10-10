import type { StarknetWindowObject } from "@starknet-io/types-js"

export function getInjectedArgentX() {
  return window?.starknet_argentX as
    | (StarknetWindowObject & {
        isInAppBrowser: boolean
      })
    | undefined
}
