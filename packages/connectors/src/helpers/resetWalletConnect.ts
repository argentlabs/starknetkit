// to make sure WC is disconnected
const canReset = (): boolean =>
  Object.keys(localStorage).some(
    (key) => key === "walletconnect" || key.startsWith("wc@2:"),
  )

export const resetWalletConnect = () => {
  if (!canReset()) {
    return
  }

  delete localStorage["walletconnect"]
  for (const key in localStorage) {
    if (key.startsWith("wc@2:")) {
      delete localStorage[key]
    }
  }
}
