import Bowser from "bowser"
import type { StoreVersion } from "../types/modal"

export const globalWindow = typeof window !== "undefined" ? window : null

export function getStoreVersionFromBrowser(): StoreVersion | null {
  if (!globalWindow) {
    return null
  }

  const browserName = Bowser.getParser(globalWindow.navigator.userAgent)
    .getBrowserName()
    ?.toLowerCase()
  switch (browserName) {
    case "firefox":
      return "firefox"
    case "microsoft edge":
      return "edge"
    case "android browser":
    case "chrome":
    case "chromium":
    case "electron":
    case "opera": // opera is chromium based
    case "vivaldi": // vivaldi is chromium based
      return "chrome"
    default:
      return null
  }
}
