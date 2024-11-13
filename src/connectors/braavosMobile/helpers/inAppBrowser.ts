export const isInBraavosMobileAppBrowser = (): boolean => {
  if (typeof window === "undefined") {
    return false
  }

  const userAgent = navigator.userAgent.toLowerCase()
  const isBraavosMobileApp = userAgent.includes("braavos")

  if (!isBraavosMobileApp) {
    return false
  }

  return isBraavosMobileApp
}
