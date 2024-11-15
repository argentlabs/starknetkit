import { getInjectedArgentX } from "./getInjectedArgentX"

export const isInArgentMobileAppBrowser = (): boolean => {
  if (typeof window === "undefined") {
    return false
  }

  const argentX = getInjectedArgentX()

  if (!argentX) {
    return false
  }

  return argentX.isInAppBrowser
}
