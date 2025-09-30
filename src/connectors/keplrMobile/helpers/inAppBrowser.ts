export const isInKeplrMobileAppBrowser = (): boolean => {
  if (typeof window === "undefined") {
    return false
  }

  const userAgent = navigator.userAgent
  const isKeplrMobileApp = userAgent.includes("KeplrWalletMobile")

  if (!isKeplrMobileApp) {
    return false
  }

  return isKeplrMobileApp
}
